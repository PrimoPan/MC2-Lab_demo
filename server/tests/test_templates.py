"""Bounded plain-text news sections and editable leader profile validation."""
import copy
import json
from pathlib import Path
import unittest

from server.validation import ValidationError, validate_content, validate_posts

ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / 'seed-people.json'
if not SEED.exists():
    SEED = ROOT / 'src/data/peopleContent.generated.json'


def bilingual(value=''):
    return {'en': value, 'zh-CN': ''}


def post():
    return {'id': 'template-example', 'slug': 'template-example', 'date': '2026-11-12',
            'title': bilingual('Template example'), 'summary': bilingual(), 'body': bilingual(),
            'image': '', 'published': True, 'template': 'gallery',
            'sections': [{'id': 'section-1', 'layout': 'gallery', 'heading': bilingual('Pictures'),
                          'body': bilingual(), 'images': [{'id': 'photo-1', 'url': '/images/example.png',
                                                          'alt': bilingual('A photo'), 'caption': bilingual('Caption')}]}]}


def leader():
    return {'pageLabel': 'Lab leader', 'documentTitle': 'Leader | MC2', 'profileAlt': 'Photo',
            'title': 'Professor', 'subtitle': 'Research', 'meta': '', 'homepageLabel': 'Homepage',
            'photo': '/images/example.png', 'homepage': 'https://example.test/', 'projectsTitle': 'Projects',
            'sections': [{'title': 'Bio', 'paragraphs': ['Plain <script> text; never rendered as HTML']}],
            'projects': [{'title': 'Example', 'body': 'Description'}]}


class ContentTemplateTest(unittest.TestCase):
    def test_all_templates_accept_safe_bilingual_image_or_text_sections(self):
        for template in ('announcement', 'image-left', 'image-right', 'gallery'):
            value = post()
            value['template'] = template
            self.assertEqual(validate_posts([value]), [value])
        value['sections'][0]['images'] = []
        value['sections'][0]['body']['en'] = 'A text section'
        self.assertEqual(validate_posts([value]), [value])
        value['sections'][0]['body']['en'] = ''
        with self.assertRaises(ValidationError):
            validate_posts([value])

    def test_blank_image_placeholder_does_not_replace_required_article_content(self):
        value = post()
        value['sections'][0]['images'][0]['url'] = ''
        value['body']['en'] = 'Existing article body'
        self.assertEqual(validate_posts([value]), [value])
        value['body']['en'] = ''
        with self.assertRaises(ValidationError):
            validate_posts([value])
        value['sections'][0]['images'][0]['url'] = '/images/example.png'
        value['sections'][0]['layout'] = 'text'
        with self.assertRaises(ValidationError):
            validate_posts([value])

    def test_invalid_template_structure_or_image_is_rejected(self):
        for kind in ('template', 'layout', 'duplicate-section', 'duplicate-image', 'unsafe-image',
                     'empty-image', 'extra-field', 'missing-language', 'long-caption', 'too-many-sections'):
            value = post()
            section = value['sections'][0]
            image = section['images'][0]
            if kind == 'template': value['template'] = 'html'
            if kind == 'layout': section['layout'] = 'iframe'
            if kind == 'duplicate-section': value['sections'].append(copy.deepcopy(section))
            if kind == 'duplicate-image': section['images'].append(copy.deepcopy(image))
            if kind == 'unsafe-image': image['url'] = 'javascript:alert(1)'
            if kind == 'empty-image': image['url'] = ''
            if kind == 'extra-field': section['html'] = '<b>Unsafe</b>'
            if kind == 'missing-language': del image['alt']['zh-CN']
            if kind == 'long-caption': image['caption']['en'] = 'x' * 1001
            if kind == 'too-many-sections': value['sections'] *= 41
            with self.subTest(kind=kind), self.assertRaises(ValidationError):
                validate_posts([value])

    def test_leader_optional_for_legacy_and_bilingual_when_added(self):
        content = json.loads(SEED.read_text())
        self.assertEqual(validate_content(content), content)
        content['en']['leader'] = leader()
        with self.assertRaises(ValidationError):
            validate_content(content)
        content['zh-CN']['leader'] = leader()
        self.assertEqual(validate_content(content), content)
        for field in ('homepage', 'photo'):
            bad = copy.deepcopy(content)
            bad['en']['leader'][field] = 'javascript:alert(1)'
            with self.subTest(field=field), self.assertRaises(ValidationError):
                validate_content(bad)
        bad = copy.deepcopy(content)
        bad['en']['leader']['sections'][0]['paragraphs'] = ['x'] * 31
        with self.assertRaises(ValidationError):
            validate_content(bad)
