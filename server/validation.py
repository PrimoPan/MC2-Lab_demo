"""Validate the bilingual public-content document before any database write."""
import re
from datetime import date
from urllib.parse import unquote, urlsplit

LOCALES = ("en", "zh-CN")
ROLES = {"chair", "postdoc", "admin", "phd", "mphil", "ra", "leader", "other"}
LABELS = {"pageHeading", "currentLabel", "alumniLabel", "searchPlaceholder", "searchAria",
          "roleFilterAria", "emptyText", "fallbackResearch"}
MEMBER_FIELDS = {"key", "name", "role", "positionTitle", "cohortTerm", "cohortYear",
                 "photo", "researchDirection", "website"}
KEY = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class ValidationError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise ValidationError(message)


def text(value, field, maximum=500, required=False):
    require(isinstance(value, str), f"{field} must be text")
    require(len(value) <= maximum, f"{field} is too long")
    require(not required or bool(value.strip()), f"{field} is required")
    require(not any(ord(c) < 32 and c not in '\n\t' for c in value), f"{field} contains control characters")
    return value


def safe_url(value, field, image=False):
    text(value, field, 2048)
    if not value:
        return
    require(not any(c.isspace() or ord(c) < 32 for c in value), f"{field} contains whitespace")
    decoded = unquote(value)
    require('\\' not in decoded and not any(ord(c) < 32 for c in decoded), f"{field} is unsafe")
    try:
        parsed = urlsplit(value)
    except ValueError as exc:
        raise ValidationError(f"{field} is not a valid URL") from exc
    if value.startswith('/'):
        require(not value.startswith('//') and not parsed.netloc and not parsed.scheme, f"{field} must be a site path")
        require('..' not in unquote(parsed.path).split('/'), f"{field} must not traverse directories")
        if image:
            require(parsed.path.startswith(('/images/', '/media/people/')), f"{field} must use an image path")
        return
    require(not image, f"{field} must use a site image or an uploaded photo")
    require(parsed.scheme == 'https' and bool(parsed.hostname) and not parsed.username and not parsed.password,
            f"{field} must be HTTPS or a site path")
    try:
        require(parsed.port in (None, 443), f"{field} uses an unsupported port")
    except ValueError as exc:
        raise ValidationError(f"{field} has an invalid port") from exc


def validate_content(content):
    require(isinstance(content, dict) and set(content) == set(LOCALES), "Both en and zh-CN are required")
    for locale in LOCALES:
        page = content[locale]
        require(isinstance(page, dict) and set(page) == LABELS | {'roleChips', 'members', 'alumniGroups'},
                f"{locale} has missing or unknown fields")
        for field in LABELS:
            text(page[field], f"{locale}.{field}", 500, True)
        require(isinstance(page['roleChips'], list) and len(page['roleChips']) <= 12, "Invalid role filters")
        chip_roles = []
        for chip in page['roleChips']:
            require(isinstance(chip, dict) and set(chip) == {'role', 'label'}, "Invalid role filter")
            require(isinstance(chip['role'], str) and chip['role'] in ROLES | {'all'}, "Unknown role filter")
            text(chip['label'], 'role label', 80, True)
            chip_roles.append(chip['role'])
        require(len(chip_roles) == len(set(chip_roles)) and 'all' in chip_roles, "Duplicate or missing role filter")
        members = page['members']
        require(isinstance(members, list) and 1 <= len(members) <= 1000, "Members must contain 1–1000 records")
        keys = set()
        for member in members:
            require(isinstance(member, dict) and MEMBER_FIELDS <= set(member) <= MEMBER_FIELDS | {'drivePhotoSource'},
                    'Member has missing or unknown fields')
            key = text(member['key'], 'member key', 100, True)
            require(bool(KEY.fullmatch(key)) and key not in keys, 'Member keys must be unique lowercase slugs')
            keys.add(key)
            text(member['name'], 'member name', 160, True)
            text(member['positionTitle'], 'position title', 300, True)
            text(member['researchDirection'], 'research direction', 2000)
            require(isinstance(member['role'], str) and member['role'] in ROLES, 'Unknown member role')
            require(member['cohortTerm'] in ('', 'Spring', 'Fall'), 'Unknown cohort term')
            year = member['cohortYear']
            require(year is None or type(year) is int and 1950 <= year <= 2100, 'Invalid cohort year')
            safe_url(member['photo'], 'photo', image=True)
            safe_url(member['website'], 'website')
            if 'drivePhotoSource' in member:
                safe_url(member['drivePhotoSource'], 'drive photo source')
        groups = page['alumniGroups']
        require(isinstance(groups, list) and len(groups) <= 100, 'Too many alumni groups')
        total = 0
        for group in groups:
            require(isinstance(group, dict) and set(group) == {'heading', 'entries'}, 'Invalid alumni group')
            text(group['heading'], 'alumni group heading', 160, True)
            require(isinstance(group['entries'], list), 'Alumni entries must be a list')
            total += len(group['entries'])
            require(total <= 2000, 'Too many alumni records')
            for entry in group['entries']:
                require(isinstance(entry, dict) and set(entry) == {'name', 'detail'}, 'Invalid alumni record')
                text(entry['name'], 'alumni name', 160, True)
                text(entry['detail'], 'alumni detail', 2000)
    en, zh = (content[locale] for locale in LOCALES)
    require([m['key'] for m in en['members']] == [m['key'] for m in zh['members']],
            'English and Chinese member keys/order must match')
    # Public membership roles are independent of authentication privileges.
    shared = ('role', 'cohortTerm', 'cohortYear', 'photo', 'website', 'drivePhotoSource')
    for left, right in zip(en['members'], zh['members']):
        require(all(left.get(k) == right.get(k) for k in shared), 'Shared member fields must match in both languages')
    require([c['role'] for c in en['roleChips']] == [c['role'] for c in zh['roleChips']], 'Role filters must match')
    require([len(g['entries']) for g in en['alumniGroups']] == [len(g['entries']) for g in zh['alumniGroups']],
            'English and Chinese alumni groups/record counts must match')
    return content


def validate_posts(posts):
    require(isinstance(posts, list) and len(posts) <= 500, 'News must contain at most 500 posts')
    ids, slugs = set(), set()
    for post in posts:
        require(isinstance(post, dict) and set(post) == {'id', 'slug', 'date', 'title', 'summary', 'body', 'image', 'published'},
                'News post has missing or unknown fields')
        identifier = text(post['id'], 'post id', 100, True)
        require(bool(re.fullmatch(r'[a-zA-Z0-9_-]+', identifier)) and identifier not in ids, 'Invalid or duplicate post id')
        ids.add(identifier)
        slug = text(post['slug'], 'post slug', 100, True)
        require(bool(KEY.fullmatch(slug)) and slug not in slugs, 'Invalid or duplicate post slug')
        slugs.add(slug)
        day = text(post['date'], 'post date', 10, True)
        try:
            require(date.fromisoformat(day).isoformat() == day, 'Date must be YYYY-MM-DD')
        except ValueError as exc:
            raise ValidationError('Date must be a valid YYYY-MM-DD') from exc
        for field, maximum in [('title', 200), ('summary', 1000), ('body', 50000)]:
            value = post[field]
            require(isinstance(value, dict) and set(value) == set(LOCALES), f'{field} requires en and zh-CN')
            for locale in LOCALES:
                text(value[locale], f'{field}.{locale}', maximum, locale == 'en' and field in ('title', 'body'))
        safe_url(post['image'], 'news image', image=True)
        require(type(post['published']) is bool, 'published must be true or false')
    return posts
