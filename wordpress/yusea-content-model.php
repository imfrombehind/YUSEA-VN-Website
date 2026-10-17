<?php
/**
 * Plugin Name: YUSEA Content Model
 * Description: The WordPress side of the YUSEA headless site: Project and Report post types, the Pillar taxonomy and all their fields; the Work, Projects and Publications pages; editor layouts for new projects, reports and posts; "View" links that open the Next.js site; and Tools → YUSEA Setup for status and starter content.
 * Version:     1.4.0
 * Requires PHP: 7.4
 *
 * Needs WPGraphQL, Secure Custom Fields (or ACF) and WPGraphQL for ACF (v2)
 * active. SCF is a fork of ACF with the same acf_* functions, so this file
 * calls those. Without SCF/ACF, the post types and taxonomy still register;
 * the fields wait for it.
 *
 * Install: zip this file, then Plugins → Add New → Upload Plugin → Activate.
 * See README.md ("What to build in WordPress") for the full field spec.
 *
 * Safe to activate on a site with content: it never edits or deletes an
 * existing field. Fields it adds to the existing groups are saved to the
 * database like any field made in the SCF UI, so they stay editable there.
 */

if (!defined('ABSPATH')) {
    exit;
}

const YUSEA_CM_VERSION = '1.4.0';

/* ------------------------------------------------------------------ *
 * 1. Post types, taxonomy, page excerpts
 * ------------------------------------------------------------------ */

function yusea_cm_register_types() {
    // Skip anything already registered (by SCF's Post Types screen or CPT UI),
    // so the two never fight.
    if (!post_type_exists('project')) {
        register_post_type('project', [
            'labels'              => yusea_cm_labels('Project', 'Projects'),
            'public'              => true,
            'has_archive'         => false,
            'menu_icon'           => 'dashicons-location-alt',
            'menu_position'       => 20,
            'supports'            => ['title', 'editor', 'excerpt', 'revisions'],
            'rewrite'             => ['slug' => 'work/projects'],
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'project',
            'graphql_plural_name' => 'projects',
        ]);
    }

    if (!post_type_exists('report')) {
        register_post_type('report', [
            'labels'              => yusea_cm_labels('Report', 'Reports'),
            'public'              => true,
            'has_archive'         => false,
            'menu_icon'           => 'dashicons-media-document',
            'menu_position'       => 21,
            'supports'            => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'rewrite'             => ['slug' => 'work/publications/reports'],
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'report',
            'graphql_plural_name' => 'reports',
        ]);
    }

    if (!taxonomy_exists('pillar')) {
        register_taxonomy('pillar', ['post', 'project', 'report'], [
            'labels'              => yusea_cm_labels('Pillar', 'Pillars'),
            'public'              => true,
            // Checkbox UI in the editor, so editors pick from the fixed set.
            'hierarchical'        => true,
            'show_admin_column'   => true,
            'rewrite'             => ['slug' => 'pillar'],
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'pillar',
            'graphql_plural_name' => 'pillars',
        ]);
    }

    // The /about excerpt is its meta description.
    add_post_type_support('page', 'excerpt');
}
add_action('init', 'yusea_cm_register_types', 20);

function yusea_cm_labels($singular, $plural) {
    return [
        'name'          => $plural,
        'singular_name' => $singular,
        'add_new_item'  => "Add New $singular",
        'edit_item'     => "Edit $singular",
        'new_item'      => "New $singular",
        'view_item'     => "View $singular",
        'search_items'  => "Search $plural",
        'not_found'     => "No " . strtolower($plural) . " found",
        'all_items'     => "All $plural",
        'menu_name'     => $plural,
    ];
}

register_activation_hook(__FILE__, function () {
    yusea_cm_register_types();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, 'flush_rewrite_rules');

/* ------------------------------------------------------------------ *
 * 2. New ACF field groups (registered in code)
 * ------------------------------------------------------------------ */

/** A plain ACF field definition. `$name` is also its GraphQL field name. */
function yusea_cm_field($key, $name, $label, $type = 'text', $extra = []) {
    return array_merge([
        'key'                => 'field_yusea_' . $key,
        'name'               => $name,
        'label'              => $label,
        'type'               => $type,
        'show_in_graphql'    => 1,
        'graphql_field_name' => $name,
    ], $extra);
}

function yusea_cm_group_settings($graphql_name) {
    return [
        'show_in_graphql'                       => 1,
        'graphql_field_name'                    => $graphql_name,
        'map_graphql_types_from_location_rules' => 1,
        'graphql_types'                         => [],
    ];
}

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array_merge([
        'key'      => 'group_yusea_project_fields',
        'title'    => 'Project Fields',
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'project']]],
        'position' => 'normal',
        'fields'   => [
            yusea_cm_field('project_status', 'status', 'Status', 'radio', [
                // Radio, not Select: WPGraphQL for ACF v2 returns a list for
                // Select fields, and the frontend expects a single string.
                'choices'       => ['active' => 'Active', 'completed' => 'Completed', 'planned' => 'Planned'],
                'default_value' => 'active',
                'layout'        => 'horizontal',
                'return_format' => 'value',
            ]),
            yusea_cm_field('project_city', 'city', 'City'),
            yusea_cm_field('project_province', 'province', 'Province'),
            yusea_cm_field('project_latitude', 'latitude', 'Latitude', 'number', ['step' => 'any']),
            yusea_cm_field('project_longitude', 'longitude', 'Longitude', 'number', ['step' => 'any']),
            yusea_cm_field('project_hero_image', 'heroImage', 'Hero image', 'image', [
                'instructions'  => 'Shown 16:9 on the project page and 3:2 on cards.',
                'return_format' => 'array',
            ]),
            yusea_cm_field('project_metrics', 'metrics', 'Impact metrics', 'repeater', [
                'layout'       => 'table',
                'button_label' => 'Add metric',
                'sub_fields'   => [
                    yusea_cm_field('project_metric_value', 'value', 'Value', 'text', ['instructions' => 'e.g. 31km']),
                    yusea_cm_field('project_metric_description', 'description', 'Description'),
                    yusea_cm_field('project_metric_source', 'source', 'Source'),
                ],
            ]),
        ],
    ], yusea_cm_group_settings('projectFields')));

    acf_add_local_field_group(array_merge([
        'key'      => 'group_yusea_report_fields',
        'title'    => 'Report Fields',
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'report']]],
        'position' => 'side',
        'fields'   => [
            yusea_cm_field('report_file', 'file', 'Report file', 'file', [
                'instructions'  => 'The full report, usually a PDF. Leave empty to hide the download button.',
                'return_format' => 'array',
            ]),
        ],
    ], yusea_cm_group_settings('reportFields')));

    acf_add_local_field_group(array_merge([
        'key'      => 'group_yusea_pillar_fields',
        'title'    => 'Pillar Fields',
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'pillar']]],
        'fields'   => [
            yusea_cm_field('pillar_image', 'image', 'Card image', 'image', [
                'instructions'  => 'Homepage Our Focus card, shown at 3:2. The term description is the card text.',
                'return_format' => 'array',
            ]),
        ],
    ], yusea_cm_group_settings('pillarFields')));
});

/* ------------------------------------------------------------------ *
 * 3. Additions to the existing Homepage and Site Settings groups
 * ------------------------------------------------------------------ */

/** Label fields with their default wording, so the site has copy immediately. */
function yusea_cm_label($key, $name, $label, $default, $type = 'text') {
    return yusea_cm_field($key, $name, $label, $type, ['default_value' => $default]);
}

function yusea_cm_link_rows($key, $name, $label) {
    return yusea_cm_field($key, $name, $label, 'repeater', [
        'layout'       => 'table',
        'button_label' => 'Add link',
        'sub_fields'   => [
            yusea_cm_field($key . '_label', 'label', 'Label'),
            yusea_cm_field($key . '_href', 'href', 'Link', 'text', ['instructions' => 'e.g. /work/projects?pillar=urban-mobility']),
        ],
    ]);
}

/** What to add where. Keyed by the existing group's GraphQL field name. */
function yusea_cm_additions() {
    return [
        'homepageFields' => [
            'fields' => [
                yusea_cm_field('our_focus', 'ourFocus', 'Our Focus', 'group', [
                    'layout'     => 'block',
                    'sub_fields' => [
                        yusea_cm_label('our_focus_heading', 'heading', 'Heading', 'Our Focus'),
                        yusea_cm_label('our_focus_cta_label', 'ctaLabel', 'Button label', 'Discover all our initiatives'),
                        yusea_cm_label('our_focus_cta_href', 'ctaHref', 'Button link', '/work'),
                        yusea_cm_label('our_focus_link_label', 'linkLabel', 'Card link label', 'Explore more'),
                    ],
                ]),
            ],
            'inside' => [
                'hero' => [
                    yusea_cm_field('hero_backgrounds', 'backgrounds', 'Slideshow', 'gallery', [
                        'instructions'  => 'Add 4 or more landscape photos (at least 2000px wide). They crossfade every 6 seconds; drag to reorder. When this has photos it replaces Background.',
                        'return_format' => 'array',
                        'preview_size'  => 'medium',
                        'insert'        => 'append',
                        'library'       => 'all',
                    ]),
                ],
                'ourFocus' => [
                    yusea_cm_label('our_focus_eyebrow', 'eyebrow', 'Eyebrow', 'What we work on', 'text') + ['menu_order' => -1],
                ],
            ],
            // Old sections the homepage no longer shows. Deleting a field keeps
            // its saved values in the database.
            'remove' => ['missionGrid', 'projects', 'latestPosts', 'partners'],
            // The frontend renders statsBand.intro as rich text.
            'retype' => ['statsBand' => ['intro' => 'wysiwyg']],
        ],
        'siteSettingsFields' => [
            'fields' => [
                yusea_cm_field('work', 'work', 'Work pages', 'group', [
                    'layout'     => 'block',
                    'sub_fields' => [
                        yusea_cm_label('work_hub_eyebrow', 'hubEyebrow', '/work eyebrow', 'Our work'),
                        yusea_cm_label('work_hub_heading', 'hubHeading', '/work heading', 'Projects and publications'),
                        yusea_cm_label('work_hub_intro', 'hubIntro', '/work intro', 'Everything YUSEA is working on, and everything we have published. Filter by focus area to see one pillar at a time.', 'textarea'),
                        yusea_cm_label('work_projects_eyebrow', 'projectsEyebrow', '/work/projects eyebrow', 'Our work'),
                        yusea_cm_label('work_projects_heading', 'projectsHeading', '/work/projects heading', 'Projects'),
                        yusea_cm_label('work_projects_intro', 'projectsIntro', '/work/projects intro', 'Programmes we run with provinces, cities and communities across Viet Nam.', 'textarea'),
                        yusea_cm_label('work_publications_eyebrow', 'publicationsEyebrow', '/work/publications eyebrow', 'Our work'),
                        yusea_cm_label('work_publications_heading', 'publicationsHeading', '/work/publications heading', 'Publications'),
                        yusea_cm_label('work_publications_intro', 'publicationsIntro', '/work/publications intro', 'Research reports and writing from the YUSEA team.', 'textarea'),
                        yusea_cm_label('work_filter_label', 'filterLabel', 'Filter row label (screen readers)', 'Filter by focus'),
                        yusea_cm_label('work_filter_all', 'filterAllLabel', '"All" filter chip', 'All'),
                        yusea_cm_label('work_projects_section', 'projectsSectionHeading', '/work projects heading', 'Projects'),
                        yusea_cm_label('work_publications_section', 'publicationsSectionHeading', '/work publications heading', 'Publications'),
                        yusea_cm_label('work_view_all_projects', 'viewAllProjectsLabel', '"All projects" link', 'All projects'),
                        yusea_cm_label('work_view_all_publications', 'viewAllPublicationsLabel', '"All publications" link', 'All publications'),
                        yusea_cm_label('work_empty', 'emptyText', 'Empty list text', 'Nothing published here yet.'),
                        yusea_cm_label('work_kind_blog', 'kindBlogLabel', 'Label: blog post', 'Blog'),
                        yusea_cm_label('work_kind_report', 'kindReportLabel', 'Label: report', 'Report'),
                        yusea_cm_label('work_status_active', 'statusActiveLabel', 'Label: active project', 'Active'),
                        yusea_cm_label('work_status_completed', 'statusCompletedLabel', 'Label: completed project', 'Completed'),
                        yusea_cm_label('work_status_planned', 'statusPlannedLabel', 'Label: planned project', 'Planned'),
                        yusea_cm_label('work_metrics_heading', 'metricsHeading', 'Project page: metrics heading', 'Impact'),
                        yusea_cm_label('work_download_report', 'downloadReportLabel', 'Report page: download button', 'Download the full report'),
                    ],
                ]),
            ],
            // Sub-fields to add inside an existing repeater, keyed by its GraphQL name.
            'inside' => [
                'navigation' => [
                    // Per-item column headings, e.g. Projects: "By focus", Publications: "By type".
                    yusea_cm_label('nav_categories_heading', 'categoriesHeading', 'Dropdown heading: categories', 'Categories'),
                    yusea_cm_label('nav_quick_links_heading', 'quickLinksHeading', 'Dropdown heading: quick links', 'Quick links'),
                    yusea_cm_link_rows('nav_categories', 'categories', 'Dropdown: categories'),
                    yusea_cm_link_rows('nav_quick_links', 'quickLinks', 'Dropdown: quick links'),
                ],
                'social' => [
                    yusea_cm_field('social_icon', 'icon', 'Icon', 'image', [
                        'instructions'  => 'Optional. Square, shown at 20×20 (upload 64×64 or larger, PNG or SVG). Leave empty to use the built-in LinkedIn / Facebook / Instagram icon.',
                        'return_format' => 'array',
                        'preview_size'  => 'thumbnail',
                    ]),
                ],
            ],
        ],
    ];
}

/** "Homepage Fields" / "homepage_fields" → "homepageFields", as WPGraphQL derives it. */
function yusea_cm_camel($text) {
    $words = preg_split('/[^A-Za-z0-9]+/', (string) $text, -1, PREG_SPLIT_NO_EMPTY);
    if (!$words) {
        return '';
    }
    $first = array_shift($words);
    return lcfirst($first) . implode('', array_map('ucfirst', $words));
}

function yusea_cm_graphql_name($item, $fallback_key) {
    if (!empty($item['graphql_field_name'])) {
        return $item['graphql_field_name'];
    }
    return yusea_cm_camel($item[$fallback_key] ?? '');
}

function yusea_cm_find_by_graphql_name($items, $graphql_name, $fallback_key) {
    foreach ((array) $items as $item) {
        if (yusea_cm_graphql_name($item, $fallback_key) === $graphql_name) {
            return $item;
        }
    }
    return null;
}

/** Saves a field (and, recursively, its sub-fields) to the database. */
function yusea_cm_create_field($field, $parent_id, $menu_order) {
    $subs = $field['sub_fields'] ?? [];
    unset($field['sub_fields']);
    $field['parent']     = $parent_id;
    $field['menu_order'] = $menu_order;

    $saved = acf_update_field($field);
    foreach (array_values($subs) as $i => $sub) {
        yusea_cm_create_field($sub, $saved['ID'], $i);
    }
    return $saved;
}

/**
 * A field this plugin created (key "field_yusea_…") must be visible to
 * WPGraphQL under the name the frontend queries. Fields made by hand are
 * never touched. Returns true if it had to fix something.
 */
function yusea_cm_repair_graphql($field, $graphql_name) {
    if (strpos($field['key'] ?? '', 'field_yusea_') !== 0 || empty($field['ID'])) {
        return false;
    }
    $exposed = !isset($field['show_in_graphql']) || !empty($field['show_in_graphql']);
    if ($exposed && ($field['graphql_field_name'] ?? '') === $graphql_name) {
        return false;
    }
    $field['show_in_graphql']    = 1;
    $field['graphql_field_name'] = $graphql_name;
    acf_update_field($field);
    return true;
}

/** Adds each missing field to `$parent` (a field group or a repeater). */
function yusea_cm_add_missing($parent, $wanted, $where, &$log) {
    $existing = acf_get_fields($parent) ?: [];
    $order    = count($existing);

    foreach ($wanted as $field) {
        $name  = $field['graphql_field_name'];
        $found = yusea_cm_find_by_graphql_name($existing, $name, 'name');
        if ($found) {
            $log[] = yusea_cm_repair_graphql($found, $name)
                ? "$where.$name existed but was hidden from GraphQL — now exposed as \"$name\"."
                : "$where.$name already exists — left as is.";
            continue;
        }
        yusea_cm_create_field($field, $parent['ID'], $field['menu_order'] ?? $order++);
        $log[] = "$where.$name added.";
    }
}

function yusea_cm_migrate() {
    $log    = [];
    $groups = acf_get_field_groups();

    foreach (yusea_cm_additions() as $group_name => $spec) {
        $group = yusea_cm_find_by_graphql_name($groups, $group_name, 'title');

        if (!$group) {
            $log[] = "ERROR: no field group with GraphQL name \"$group_name\". Add its fields by hand (see README).";
            continue;
        }
        if (empty($group['ID'])) {
            // Defined in PHP or acf-json, not the database: can't extend it from here.
            $log[] = "ERROR: \"$group_name\" is not stored in the database (local JSON/PHP). Add its fields by hand (see README).";
            continue;
        }

        yusea_cm_add_missing($group, $spec['fields'], $group_name, $log);

        foreach ($spec['inside'] ?? [] as $repeater_name => $sub_fields) {
            $repeater = yusea_cm_find_by_graphql_name(acf_get_fields($group), $repeater_name, 'name');
            if (!$repeater || empty($repeater['ID'])) {
                $log[] = "ERROR: \"$group_name.$repeater_name\" not found. Add its sub-fields by hand (see README).";
                continue;
            }
            yusea_cm_add_missing($repeater, $sub_fields, "$group_name.$repeater_name", $log);
        }

        foreach ($spec['remove'] ?? [] as $name) {
            $field = yusea_cm_find_by_graphql_name(acf_get_fields($group) ?: [], $name, 'name');
            if ($field && !empty($field['ID'])) {
                acf_delete_field($field['ID']);
                $log[] = "$group_name.$name removed (no longer on the site; its saved values stay in the database).";
            }
        }

        foreach ($spec['retype'] ?? [] as $parent_name => $children) {
            $parent = yusea_cm_find_by_graphql_name(acf_get_fields($group) ?: [], $parent_name, 'name');
            if (!$parent) {
                continue;
            }
            foreach ($children as $child_name => $type) {
                $child = yusea_cm_find_by_graphql_name(acf_get_fields($parent) ?: [], $child_name, 'name');
                if (!$child || empty($child['ID']) || $child['type'] === $type) {
                    continue;
                }
                $old           = $child['type'];
                $child['type'] = $type;
                if ($type === 'wysiwyg') {
                    $child += ['tabs' => 'all', 'toolbar' => 'basic', 'media_upload' => 0];
                }
                acf_update_field($child);
                $log[] = "$group_name.$parent_name.$child_name changed from $old to $type (text kept).";
            }
        }
    }

    return array_merge($log, yusea_cm_ensure_pages());
}

/**
 * Runs once per plugin version, on the first admin page load after
 * activation, when ACF is fully loaded. Re-running is harmless: existing
 * fields are detected and skipped.
 */
add_action('admin_init', function () {
    if (!current_user_can('manage_options') || !function_exists('acf_update_field')) {
        return;
    }
    if (get_option('yusea_cm_migrated') === YUSEA_CM_VERSION) {
        return;
    }

    $log = yusea_cm_migrate();
    update_option('yusea_cm_migrated', YUSEA_CM_VERSION, false);
    update_option('yusea_cm_migration_log', $log, false);
});

// Shows the result once, then forgets it.
add_action('admin_notices', function () {
    $log = get_option('yusea_cm_migration_log');
    if (!$log || !current_user_can('manage_options')) {
        return;
    }
    delete_option('yusea_cm_migration_log');

    $failed = (bool) array_filter($log, fn($line) => strpos($line, 'ERROR') === 0);
    printf(
        '<div class="notice notice-%s"><p><strong>YUSEA Content Model:</strong></p><ul style="list-style:disc;padding-left:1.5em">%s</ul></div>',
        $failed ? 'warning' : 'success',
        implode('', array_map(fn($line) => '<li>' . esc_html($line) . '</li>', $log))
    );
});

/* ------------------------------------------------------------------ *
 * 4. Index pages: Work, Projects, Publications
 *
 * Each page's title is its heading and its excerpt the intro; the ACF
 * fields below add the eyebrow and the /work section labels. The frontend
 * falls back to the Site Settings `work` group for anything left empty.
 * ------------------------------------------------------------------ */

function yusea_cm_index_pages() {
    return [
        'work' => [
            'title'   => 'Projects and publications',
            'excerpt' => 'Everything YUSEA is working on, and everything we have published. Filter by focus area to see one pillar at a time.',
        ],
        'work/projects' => [
            'title'   => 'Projects',
            'excerpt' => 'Programmes we run with provinces, cities and communities across Viet Nam.',
        ],
        'work/publications' => [
            'title'   => 'Publications',
            'excerpt' => 'Research reports and writing from the YUSEA team.',
        ],
    ];
}

/** Creates any index page that doesn't exist yet. Existing pages are never edited. */
function yusea_cm_ensure_pages() {
    $log = [];
    foreach (yusea_cm_index_pages() as $path => $page) {
        if (get_page_by_path($path)) {
            $log[] = "Page /$path already exists — left as is.";
            continue;
        }
        $parent_path = dirname($path);
        $parent      = $parent_path === '.' ? null : get_page_by_path($parent_path);

        $id = wp_insert_post([
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_title'   => $page['title'],
            'post_name'    => basename($path),
            'post_excerpt' => $page['excerpt'],
            'post_content' => '',
            'post_parent'  => $parent ? $parent->ID : 0,
        ], true);

        $log[] = is_wp_error($id)
            ? "ERROR: could not create page /$path: " . $id->get_error_message()
            : "Page /$path created (edit its title and excerpt to change the heading and intro).";
    }
    return $log;
}

/** ACF location rules matching the given page paths ("work", "work/projects"). */
function yusea_cm_page_location($paths) {
    $rules = [];
    foreach ($paths as $path) {
        $page = get_page_by_path($path);
        if ($page) {
            $rules[] = [['param' => 'page', 'operator' => '==', 'value' => (string) $page->ID]];
        }
    }
    // Before the pages exist: match nothing, but stay in the GraphQL schema.
    return $rules ?: [[['param' => 'page', 'operator' => '==', 'value' => '0']]];
}

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    // Registered on the Page type explicitly, so the GraphQL fields exist
    // whatever the location rules resolve to.
    $on_pages = [
        'show_in_graphql'                       => 1,
        'map_graphql_types_from_location_rules' => 0,
        'graphql_types'                         => ['Page'],
        'position'                              => 'side',
    ];

    acf_add_local_field_group(array_merge([
        'key'                => 'group_yusea_index_page_fields',
        'title'              => 'Index page',
        'graphql_field_name' => 'indexPageFields',
        'location'           => yusea_cm_page_location(array_keys(yusea_cm_index_pages())),
        'fields'             => [
            yusea_cm_label('index_eyebrow', 'eyebrow', 'Eyebrow', 'Our work'),
            yusea_cm_field('index_help', 'index_help', 'How this page works', 'message', [
                'message'         => 'The page <strong>title</strong> is the heading and the <strong>excerpt</strong> is the intro. The block content is not shown; the lists come from Projects, Reports and Posts.',
                'show_in_graphql' => 0,
            ]),
        ],
    ], $on_pages));

    acf_add_local_field_group(array_merge([
        'key'                => 'group_yusea_work_hub_fields',
        'title'              => 'Work page sections',
        'graphql_field_name' => 'workHubFields',
        'location'           => yusea_cm_page_location(['work']),
        'fields'             => [
            yusea_cm_label('hub_projects_heading', 'projectsHeading', 'Projects heading', 'Projects'),
            yusea_cm_label('hub_publications_heading', 'publicationsHeading', 'Publications heading', 'Publications'),
            yusea_cm_label('hub_view_all_projects', 'viewAllProjectsLabel', '"All projects" link', 'All projects'),
            yusea_cm_label('hub_view_all_publications', 'viewAllPublicationsLabel', '"All publications" link', 'All publications'),
        ],
    ], $on_pages));
});

/* ------------------------------------------------------------------ *
 * 5. Editor layouts for new Projects, Reports and Posts
 * ------------------------------------------------------------------ */

add_action('init', function () {
    $heading = fn($text) => ['core/heading', ['level' => 2, 'content' => $text]];
    $para    = fn($hint) => ['core/paragraph', ['placeholder' => $hint]];
    $list    = fn($hint) => ['core/list', [], [['core/list-item', ['placeholder' => $hint]]]];

    $templates = [
        'project' => [
            $heading('The challenge'),
            $para('What problem does this project address, where, and for whom?'),
            $heading('What we are doing'),
            $para('The approach, the partners and the timeline.'),
            $heading('Results so far'),
            $list('A result or milestone'),
        ],
        'report' => [
            $para('A short summary of the report: what it covers and why it matters.'),
            $heading('Key findings'),
            $list('A finding'),
            $heading('Recommendations'),
            $para('What provinces, cities and funders can do next.'),
        ],
        'post' => [
            $para('Open with the point of the article in a sentence or two.'),
            $heading('Section heading'),
            $para('Body text.'),
        ],
    ];

    foreach ($templates as $type => $template) {
        $object = get_post_type_object($type);
        // Only fills an empty template, so a theme's or another plugin's wins.
        if ($object && empty($object->template)) {
            $object->template = $template;
        }
    }
}, 30);

/* ------------------------------------------------------------------ *
 * 6. "View" links open the Next.js site
 *
 * Needs YUSEA_FRONTEND_URL in wp-config.php (the revalidate plugin uses
 * it too). Only published content is rewritten: the frontend can't show
 * drafts, so Preview stays on WordPress. GraphQL requests are left alone.
 * ------------------------------------------------------------------ */

function yusea_cm_frontend_path($post) {
    switch ($post->post_type) {
        case 'project':
            return '/work/projects/' . $post->post_name;
        case 'report':
            return '/work/publications/reports/' . $post->post_name;
        case 'post':
            return '/work/publications/blog/' . $post->post_name;
        case 'page':
            if ((int) get_option('page_on_front') === (int) $post->ID) {
                return '/';
            }
            return '/' . get_page_uri($post);
    }
    return null;
}

/** Shared by post_link, post_type_link and page_link; the 3rd argument is leavename/sample. */
function yusea_cm_frontend_link($link, $post, $leavename = false) {
    if ($leavename || !defined('YUSEA_FRONTEND_URL')) {
        return $link; // Keep WordPress's own link for the slug editor.
    }
    if (function_exists('is_graphql_request') && is_graphql_request()) {
        return $link;
    }
    $post = get_post($post);
    if (!$post || $post->post_status !== 'publish') {
        return $link;
    }
    $path = yusea_cm_frontend_path($post);
    return $path ? rtrim(YUSEA_FRONTEND_URL, '/') . $path : $link;
}
add_filter('post_link', 'yusea_cm_frontend_link', 20, 3);
add_filter('post_type_link', 'yusea_cm_frontend_link', 20, 3);
add_filter('page_link', 'yusea_cm_frontend_link', 20, 3);

/* ------------------------------------------------------------------ *
 * 7. Tools → YUSEA Setup: status and starter content
 * ------------------------------------------------------------------ */

/** The Site Settings field group (database copy), or null. */
function yusea_cm_settings_group() {
    if (!function_exists('acf_get_field_groups')) {
        return null;
    }
    return yusea_cm_find_by_graphql_name(acf_get_field_groups(), 'siteSettingsFields', 'title');
}

/** Where the options page stores its values ("options" unless configured otherwise). */
function yusea_cm_options_post_id($group) {
    foreach ((array) ($group['location'] ?? []) as $and) {
        foreach ((array) $and as $rule) {
            if (($rule['param'] ?? '') === 'options_page' && function_exists('acf_get_options_page')) {
                $page = acf_get_options_page($rule['value']);
                if (!empty($page['post_id'])) {
                    return $page['post_id'];
                }
            }
        }
    }
    return 'options';
}

/** The `social` repeater field and current row count, or null. */
function yusea_cm_social_field() {
    $group = yusea_cm_settings_group();
    if (!$group) {
        return null;
    }
    $field = yusea_cm_find_by_graphql_name(acf_get_fields($group) ?: [], 'social', 'name');
    if (!$field) {
        return null;
    }
    $post_id = yusea_cm_options_post_id($group);
    $rows    = get_field($field['key'], $post_id, false);
    return ['field' => $field, 'post_id' => $post_id, 'count' => is_array($rows) ? count($rows) : 0];
}

/** [ok, label, detail] rows for the status table. */
function yusea_cm_status() {
    $rows   = [];
    $rows[] = [defined('YUSEA_FRONTEND_URL'), 'Frontend URL', defined('YUSEA_FRONTEND_URL')
        ? 'YUSEA_FRONTEND_URL = ' . YUSEA_FRONTEND_URL . ' ("View" links open it).'
        : "Add define('YUSEA_FRONTEND_URL', 'https://…'); to wp-config.php. Needed for View links and revalidation."];
    $rows[] = [function_exists('acf_get_field_groups'), 'Secure Custom Fields', function_exists('acf_get_field_groups') ? 'Active.' : 'Not active: fields cannot load.'];
    $rows[] = [class_exists('WPGraphQL'), 'WPGraphQL', class_exists('WPGraphQL') ? 'Active.' : 'Not active: the frontend cannot read anything.'];
    $rows[] = [(int) get_option('page_on_front') > 0, 'Front page', (int) get_option('page_on_front') > 0
        ? 'Set (Settings → Reading). Its Homepage fields drive the homepage.'
        : 'Not set. Choose the Home page under Settings → Reading.'];

    foreach (array_keys(yusea_cm_index_pages()) as $path) {
        $page   = get_page_by_path($path);
        $rows[] = [(bool) $page, "Page /$path", $page ? 'Exists (' . $page->post_status . ').' : 'Missing: deactivate and reactivate this plugin, or create it by hand.'];
    }
    $about  = get_page_by_path('about');
    $rows[] = [$about && $about->post_status === 'publish', 'Page /about', $about ? 'Exists (' . $about->post_status . ').' : 'Missing: the frontend shows a 404.'];

    $pillars = taxonomy_exists('pillar') ? get_terms(['taxonomy' => 'pillar', 'hide_empty' => false]) : [];
    $count   = is_array($pillars) ? count($pillars) : 0;
    $rows[]  = [$count >= 3, 'Pillars', "$count of 3. The first three (in term order) are the homepage Our Focus cards."];

    $social = yusea_cm_social_field();
    $rows[] = [$social && $social['count'] > 0, 'Social links', $social ? $social['count'] . ' row(s) in Site Settings.' : 'Social repeater not found.'];

    return $rows;
}

add_action('admin_menu', function () {
    add_management_page('YUSEA Setup', 'YUSEA Setup', 'manage_options', 'yusea-setup', 'yusea_cm_setup_page');
});

function yusea_cm_setup_page() {
    echo '<div class="wrap"><h1>YUSEA Setup</h1>';

    $log = get_transient('yusea_cm_seed_log');
    if ($log && isset($_GET['seeded'])) {
        delete_transient('yusea_cm_seed_log');
        echo '<div class="notice notice-info"><p><strong>Starter content:</strong></p><ul style="list-style:disc;padding-left:1.5em">';
        foreach ($log as $line) {
            echo '<li>' . esc_html($line) . '</li>';
        }
        echo '</ul></div>';
    }

    echo '<h2>Status</h2><table class="widefat striped" style="max-width:900px"><tbody>';
    foreach (yusea_cm_status() as [$ok, $label, $detail]) {
        printf(
            '<tr><td style="width:2em;font-size:1.2em">%s</td><td><strong>%s</strong><br><span class="description">%s</span></td></tr>',
            $ok ? '&#x2705;' : '&#x26A0;&#xFE0F;',
            esc_html($label),
            esc_html($detail)
        );
    }
    echo '</tbody></table>';

    echo '<h2>Starter content</h2><p style="max-width:900px">Creates and <strong>publishes immediately</strong> the three pillars, 4 projects, 3 reports, 6 blog posts and an About page, with the text and photos from the design mock-ups. <strong>The sample text is public until you replace it.</strong> Starter drafts from an earlier run are published too. If the hero slideshow is empty, it is filled with your Background photo plus starter photos. Adds LinkedIn, Facebook and Instagram rows to Site Settings if there are no social links yet (replace their URLs with your real profiles). Your navigation is not changed. Anything that already exists, matched by slug, is skipped, so running it twice is safe. Photos are downloaded from Unsplash into the Media Library.</p>';
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
    wp_nonce_field('yusea_cm_seed');
    echo '<input type="hidden" name="action" value="yusea_cm_seed">';
    submit_button('Create starter content', 'primary', 'submit', false);
    echo '</form></div>';
}

add_action('admin_post_yusea_cm_seed', function () {
    if (!current_user_can('manage_options')) {
        wp_die('You are not allowed to do this.');
    }
    check_admin_referer('yusea_cm_seed');
    if (function_exists('set_time_limit')) {
        @set_time_limit(300); // Photo downloads can be slow.
    }

    set_transient('yusea_cm_seed_log', yusea_cm_seed(), 10 * MINUTE_IN_SECONDS);
    wp_safe_redirect(admin_url('tools.php?page=yusea-setup&seeded=1'));
    exit;
});

function yusea_cm_seed() {
    if (!function_exists('update_field') || !taxonomy_exists('pillar')) {
        return ['ERROR: Secure Custom Fields and the pillar taxonomy must be active first.'];
    }
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $data   = yusea_cm_starter_data();
    $log    = [];
    $images = [];

    // Unsplash photo ID → attachment ID, downloading each photo only once
    // (and never again on a second run).
    $image = function ($photo) use (&$images, &$log, $data) {
        if (!$photo) {
            return 0;
        }
        if (isset($images[$photo])) {
            return $images[$photo];
        }
        $existing = get_posts([
            'post_type'   => 'attachment',
            'post_status' => 'any',
            'meta_key'    => '_yusea_starter_photo',
            'meta_value'  => $photo,
            'numberposts' => 1,
            'fields'      => 'ids',
        ]);
        if ($existing) {
            return $images[$photo] = (int) $existing[0];
        }

        $tmp = download_url('https://images.unsplash.com/' . $photo . '?w=1600&q=80&auto=format&fit=crop&fm=jpg');
        if (is_wp_error($tmp)) {
            $log[] = "Photo $photo could not be downloaded (" . $tmp->get_error_message() . '); add an image by hand.';
            return $images[$photo] = 0;
        }
        $alt = $data['photos'][$photo] ?? '';
        $id  = media_handle_sideload(['name' => 'yusea-' . $photo . '.jpg', 'tmp_name' => $tmp], 0, $alt);
        if (is_wp_error($id)) {
            @unlink($tmp);
            $log[] = "Photo $photo could not be saved (" . $id->get_error_message() . '); add an image by hand.';
            return $images[$photo] = 0;
        }
        update_post_meta($id, '_wp_attachment_image_alt', $alt);
        update_post_meta($id, '_yusea_starter_photo', $photo);
        return $images[$photo] = (int) $id;
    };

    // Pillars: published, since they are structure rather than content.
    foreach ($data['pillars'] as $p) {
        if (term_exists($p['slug'], 'pillar')) {
            $log[] = "Pillar \"{$p['name']}\" already exists — left as is.";
            continue;
        }
        $term = wp_insert_term($p['name'], 'pillar', ['slug' => $p['slug'], 'description' => $p['description']]);
        if (is_wp_error($term)) {
            $log[] = "ERROR: pillar \"{$p['name']}\": " . $term->get_error_message();
            continue;
        }
        $att = $image($p['photo']);
        if ($att) {
            update_field('field_yusea_pillar_image', $att, 'term_' . $term['term_id']);
        }
        $log[] = "Pillar \"{$p['name']}\" created.";
    }

    // Published straight away, so the live site looks complete. The sample
    // text is public until editors replace it.
    $create = function ($type, $item) use (&$log, $image) {
        $existing = get_page_by_path($item['slug'], OBJECT, $type);
        if ($existing) {
            // A draft from an earlier run of this button gets published; anything
            // an editor made (no starter marker) is never touched.
            if ($existing->post_status === 'draft' && get_post_meta($existing->ID, '_yusea_starter', true)) {
                wp_update_post(['ID' => $existing->ID, 'post_status' => 'publish']);
                $log[] = ucfirst($type) . " \"{$item['title']}\" was a starter draft — now published.";
            } else {
                $log[] = ucfirst($type) . " \"{$item['title']}\" already exists — left as is.";
            }
            return 0;
        }
        $post = [
            'post_type'    => $type,
            'post_status'  => 'publish',
            'post_title'   => $item['title'],
            'post_name'    => $item['slug'],
            'post_excerpt' => $item['excerpt'],
            'post_content' => $item['content'],
        ];
        // Keeps the mock order on the lists (newest first).
        if (!empty($item['date'])) {
            $post['post_date'] = $item['date'];
        }
        $id = wp_insert_post($post, true);
        if (is_wp_error($id)) {
            $log[] = "ERROR: $type \"{$item['title']}\": " . $id->get_error_message();
            return 0;
        }
        update_post_meta($id, '_yusea_starter', 1);
        if (!empty($item['pillars'])) {
            wp_set_object_terms($id, $item['pillars'], 'pillar');
        }
        // Projects use the ACF hero image; everything else the featured image.
        if ($type !== 'project') {
            $att = $image($item['photo'] ?? null);
            if ($att) {
                set_post_thumbnail($id, $att);
            }
        }
        $log[] = ucfirst($type) . " \"{$item['title']}\" created and published.";
        return $id;
    };

    foreach ($data['projects'] as $p) {
        $id = $create('project', $p);
        if (!$id) {
            continue;
        }
        update_field('field_yusea_project_status', $p['status'], $id);
        update_field('field_yusea_project_city', $p['city'], $id);
        update_field('field_yusea_project_province', $p['province'], $id);
        update_field('field_yusea_project_latitude', $p['latitude'], $id);
        update_field('field_yusea_project_longitude', $p['longitude'], $id);
        update_field('field_yusea_project_metrics', $p['metrics'], $id);
        $att = $image($p['photo']);
        if ($att) {
            update_field('field_yusea_project_hero_image', $att, $id);
        }
    }
    foreach ($data['reports'] as $r) {
        $create('report', $r);
    }
    foreach ($data['posts'] as $p) {
        $create('post', $p);
    }
    $create('page', $data['about']);

    // Hero slideshow, only if empty: the current Background photo first, then
    // three starter photos, so four photos crossfade straight away.
    $front = (int) get_option('page_on_front');
    if (!$front) {
        $log[] = 'No front page set (Settings → Reading), so the hero slideshow was not filled.';
    } elseif (get_field('field_yusea_hero_backgrounds', $front, false)) {
        $log[] = 'Hero slideshow already has photos — left as is.';
    } else {
        $slides     = [];
        $background = get_post_meta($front, 'hero_background', true);
        if (is_numeric($background) && (int) $background > 0) {
            $slides[] = (int) $background;
        }
        foreach (['photo-1583417319070-4a69db38a482', 'photo-1557750255-c76072a7aad1', 'photo-1528127269322-539801943592', 'photo-1509030450996-dd1a26dda07a'] as $photo) {
            if (count($slides) >= 4) {
                break;
            }
            $att = $image($photo);
            if ($att && !in_array($att, $slides, true)) {
                $slides[] = $att;
            }
        }
        if ($slides) {
            update_field('field_yusea_hero_backgrounds', $slides, $front);
            $log[] = 'Hero slideshow filled with ' . count($slides) . ' photos (Home page → Hero → Slideshow).';
        }
    }

    // Social rows only if there are none, so real links are never overwritten.
    $social = yusea_cm_social_field();
    if (!$social) {
        $log[] = 'Social repeater not found in Site Settings — add the rows by hand.';
    } elseif ($social['count'] > 0) {
        $log[] = 'Social links already set — left as is.';
    } else {
        update_field($social['field']['key'], $data['social'], $social['post_id']);
        $log[] = 'Social rows added for LinkedIn, Facebook and Instagram. Replace their URLs with your real profiles in Site Settings.';
    }

    $log[] = 'Navigation was not changed. Add dropdown links per row in Site Settings → navigation.';
    $log[] = 'Everything above is live. Replace the sample text, photos and "PLACEHOLDER" metric sources under Projects, Reports, Posts and Pages.';
    return $log;
}

/**
 * Starter content, generated from lib/cms/mocks/*.json so the drafts match
 * the mock site. Bodies are block-editor markup. Photos are Unsplash IDs.
 */
function yusea_cm_starter_data() {
    return [
        'pillars' => [
            [
                'slug' => 'urban-mobility',
                'name' => 'Urban mobility',
                'description' => 'Streets, transit and walkable districts that connect people to jobs, schools and each other without locking cities into car dependence.',
                'photo' => 'photo-1557750255-c76072a7aad1',
            ],
            [
                'slug' => 'climate-resilience',
                'name' => 'Climate resilience',
                'description' => 'Helping delta and coastal provinces plan for flooding, salinity and heat as design constraints rather than emergencies.',
                'photo' => 'photo-1528127269322-539801943592',
            ],
            [
                'slug' => 'liveable-neighbourhoods',
                'name' => 'Liveable neighbourhoods',
                'description' => 'Protecting the street life, shade and shared space that make dense Vietnamese neighbourhoods work as they grow.',
                'photo' => 'photo-1555921015-5532091f6026',
            ],
        ],
        'projects' => [
            [
                'slug' => 'can-tho-delta-resilience',
                'title' => 'Can Tho Delta Resilience',
                'excerpt' => 'Flood and salinity adaptation planning across the Mekong Delta’s largest urban centre.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the project body from WordPress so the single project template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The challenge</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. This section tests headings, paragraphs and lists from the block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Mapping where risk and growth overlap</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Agreeing shared targets across departments</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Publishing the data so others can build on it</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">What we are doing</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Working with provincial planners and communities to turn the plan into funded projects.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'climate-resilience',
                ],
                'status' => 'active',
                'city' => 'Can Tho',
                'province' => 'Can Tho',
                'latitude' => 10.0452,
                'longitude' => 105.7469,
                'photo' => 'photo-1559592413-7cec4d0cae2b',
                'metrics' => [
                    [
                        'value' => '12',
                        'description' => 'wards covered by the adaptation plan',
                        'source' => 'PLACEHOLDER',
                    ],
                ],
            ],
            [
                'slug' => 'da-nang-coastal-corridor',
                'title' => 'Da Nang Coastal Corridor',
                'excerpt' => 'Linking transport investment to coastal protection along the central corridor.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the project body from WordPress so the single project template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The challenge</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. This section tests headings, paragraphs and lists from the block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Mapping where risk and growth overlap</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Agreeing shared targets across departments</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Publishing the data so others can build on it</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">What we are doing</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Working with provincial planners and communities to turn the plan into funded projects.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'urban-mobility',
                    'climate-resilience',
                ],
                'status' => 'active',
                'city' => 'Da Nang',
                'province' => 'Da Nang',
                'latitude' => 16.0544,
                'longitude' => 108.2022,
                'photo' => 'photo-1509030450996-dd1a26dda07a',
                'metrics' => [
                    [
                        'value' => '31km',
                        'description' => 'of coastline assessed',
                        'source' => 'PLACEHOLDER',
                    ],
                ],
            ],
            [
                'slug' => 'ha-noi-green-neighbourhoods',
                'title' => 'Ha Noi Green Neighbourhoods',
                'excerpt' => 'Retrofitting dense inner districts for shade, walkability and stormwater capture.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the project body from WordPress so the single project template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The challenge</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. This section tests headings, paragraphs and lists from the block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Mapping where risk and growth overlap</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Agreeing shared targets across departments</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Publishing the data so others can build on it</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">What we are doing</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Working with provincial planners and communities to turn the plan into funded projects.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'liveable-neighbourhoods',
                ],
                'status' => 'completed',
                'city' => 'Ha Noi',
                'province' => 'Ha Noi',
                'latitude' => 21.0278,
                'longitude' => 105.8342,
                'photo' => 'photo-1555921015-5532091f6026',
                'metrics' => [
                    [
                        'value' => '4',
                        'description' => 'pilot districts',
                        'source' => 'PLACEHOLDER',
                    ],
                ],
            ],
            [
                'slug' => 'ho-chi-minh-city-metro-access',
                'title' => 'Ho Chi Minh City Metro Access',
                'excerpt' => 'Walking, cycling and bus links that let neighbourhoods around Metro Line 1 actually reach its stations.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the project body from WordPress so the single project template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The challenge</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. This section tests headings, paragraphs and lists from the block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Mapping where risk and growth overlap</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Agreeing shared targets across departments</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Publishing the data so others can build on it</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">What we are doing</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Working with provincial planners and communities to turn the plan into funded projects.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'urban-mobility',
                    'liveable-neighbourhoods',
                ],
                'status' => 'planned',
                'city' => 'Ho Chi Minh City',
                'province' => 'Ho Chi Minh City',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'photo' => 'photo-1583417319070-4a69db38a482',
                'metrics' => [
                    [
                        'value' => '14',
                        'description' => 'stations with access plans',
                        'source' => 'PLACEHOLDER',
                    ],
                ],
            ],
        ],
        'reports' => [
            [
                'slug' => 'mekong-delta-adaptation-review-2026',
                'date' => '2026-09-15 09:00:00',
                'title' => 'Mekong Delta adaptation review 2026',
                'excerpt' => 'Where delta provinces stand on flood and salinity planning, and which investments are falling behind.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the report summary from WordPress so the single report template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Key findings</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first finding for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second finding for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third finding for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Recommendations</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>What provinces, cities and funders can do next.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'climate-resilience',
                ],
                'photo' => 'photo-1559592413-7cec4d0cae2b',
            ],
            [
                'slug' => 'walkable-station-areas',
                'date' => '2026-08-20 09:00:00',
                'title' => 'Walkable station areas: a guide for Vietnamese cities',
                'excerpt' => 'How to plan the ten-minute walk around a new metro or BRT station so ridership follows the investment.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the report summary from WordPress so the single report template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Key findings</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first finding for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second finding for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third finding for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Recommendations</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>What provinces, cities and funders can do next.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'urban-mobility',
                ],
                'photo' => 'photo-1557750255-c76072a7aad1',
            ],
            [
                'slug' => 'shade-and-street-life',
                'date' => '2026-07-10 09:00:00',
                'title' => 'Shade and street life in dense districts',
                'excerpt' => 'Survey results from four Ha Noi districts on heat, public space and how residents use their streets.',
                'content' => '<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the report summary from WordPress so the single report template can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Key findings</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first finding for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second finding for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third finding for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Recommendations</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>What provinces, cities and funders can do next.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'climate-resilience',
                    'liveable-neighbourhoods',
                ],
                'photo' => 'photo-1555921015-5532091f6026',
            ],
        ],
        'posts' => [
            [
                'slug' => 'ho-chi-minh-city-riverfront-planning',
                'date' => '2026-09-28 09:00:00',
                'title' => 'Planning Ho Chi Minh City’s riverfront for the next generation',
                'excerpt' => 'How the Saigon River edge could balance new development with public space, flood protection and access for the neighbourhoods behind it.',
                'content' => '<!-- wp:paragraph -->
<p>How the Saigon River edge could balance new development with public space, flood protection and access for the neighbourhoods behind it.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for a WordPress post body until cms.yuseavietnam.com is live, so the article layout can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it matters</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. Body copy here exists to test headings, paragraphs, lists and links rendered from the WordPress block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third point for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What comes next</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Read more about <a href="/work/projects">our projects</a>.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'urban-mobility',
                    'liveable-neighbourhoods',
                ],
                'photo' => 'photo-1583417319070-4a69db38a482',
            ],
            [
                'slug' => 'hanoi-old-quarter-street-life',
                'date' => '2026-09-21 09:00:00',
                'title' => 'Keeping street life at the heart of Ha Noi’s Old Quarter',
                'excerpt' => 'Narrow streets, shopfront homes and shared spaces are what make the Old Quarter work. We look at how regeneration can protect them.',
                'content' => '<!-- wp:paragraph -->
<p>Narrow streets, shopfront homes and shared spaces are what make the Old Quarter work. We look at how regeneration can protect them.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for a WordPress post body until cms.yuseavietnam.com is live, so the article layout can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it matters</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. Body copy here exists to test headings, paragraphs, lists and links rendered from the WordPress block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third point for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What comes next</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Read more about <a href="/work/projects">our projects</a>.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'liveable-neighbourhoods',
                ],
                'photo' => 'photo-1555921015-5532091f6026',
            ],
            [
                'slug' => 'ha-long-bay-tourism-and-resilience',
                'date' => '2026-09-14 09:00:00',
                'title' => 'Tourism, livelihoods and resilience around Ha Long Bay',
                'excerpt' => 'Coastal provinces depend on visitors and on healthy ecosystems. Planning has to serve both at once.',
                'content' => '<!-- wp:paragraph -->
<p>Coastal provinces depend on visitors and on healthy ecosystems. Planning has to serve both at once.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for a WordPress post body until cms.yuseavietnam.com is live, so the article layout can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it matters</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. Body copy here exists to test headings, paragraphs, lists and links rendered from the WordPress block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third point for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What comes next</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Read more about <a href="/work/projects">our projects</a>.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'climate-resilience',
                ],
                'photo' => 'photo-1528127269322-539801943592',
            ],
            [
                'slug' => 'growing-up-in-a-growing-city',
                'date' => '2026-09-07 09:00:00',
                'title' => 'Growing up in a growing city: housing and density in the north',
                'excerpt' => 'New towers are reshaping the skyline. We ask what it takes to make high-density districts liveable at street level.',
                'content' => '<!-- wp:paragraph -->
<p>New towers are reshaping the skyline. We ask what it takes to make high-density districts liveable at street level.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for a WordPress post body until cms.yuseavietnam.com is live, so the article layout can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it matters</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. Body copy here exists to test headings, paragraphs, lists and links rendered from the WordPress block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third point for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What comes next</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Read more about <a href="/work/projects">our projects</a>.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'liveable-neighbourhoods',
                ],
                'photo' => 'photo-1509030450996-dd1a26dda07a',
            ],
            [
                'slug' => 'da-nang-mountains-and-visitors',
                'date' => '2026-08-31 09:00:00',
                'title' => 'Da Nang’s hills: managing visitors and landscape together',
                'excerpt' => 'Landmark attractions bring investment to the central coast. Regional plans decide whether the surrounding landscape benefits too.',
                'content' => '<!-- wp:paragraph -->
<p>Landmark attractions bring investment to the central coast. Regional plans decide whether the surrounding landscape benefits too.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for a WordPress post body until cms.yuseavietnam.com is live, so the article layout can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it matters</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. Body copy here exists to test headings, paragraphs, lists and links rendered from the WordPress block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third point for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What comes next</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Read more about <a href="/work/projects">our projects</a>.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'urban-mobility',
                ],
                'photo' => 'photo-1559592413-7cec4d0cae2b',
            ],
            [
                'slug' => 'heritage-landscapes-ninh-binh',
                'date' => '2026-08-24 09:00:00',
                'title' => 'Heritage landscapes and the case for slower growth in Ninh Binh',
                'excerpt' => 'Some places gain the most by changing least. A look at protecting heritage landscapes while supporting local incomes.',
                'content' => '<!-- wp:paragraph -->
<p>Some places gain the most by changing least. A look at protecting heritage landscapes while supporting local incomes.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for a WordPress post body until cms.yuseavietnam.com is live, so the article layout can be reviewed with realistic markup.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it matters</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Regional decisions about land, water and transport shape daily life for decades. Body copy here exists to test headings, paragraphs, lists and links rendered from the WordPress block editor.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>A first point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A second point for list styling</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>A third point for list styling</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What comes next</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Read more about <a href="/work/projects">our projects</a>.</p>
<!-- /wp:paragraph -->',
                'pillars' => [
                    'climate-resilience',
                ],
                'photo' => 'photo-1557750255-c76072a7aad1',
            ],
        ],
        'about' => [
            'slug' => 'about',
            'title' => 'About YUSEA',
            'excerpt' => 'YUSEA works alongside provinces, cities and communities to shape urban growth that is equitable, low-carbon and locally led.',
            'content' => '<!-- wp:paragraph -->
<p>YUSEA works alongside provinces, cities and communities to shape urban growth that is equitable, low-carbon and locally led.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>This is mock content.</strong> It stands in for the About page body from WordPress.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Who we are</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A team of planners, researchers and organisers based in Viet Nam, working with partners across Southeast Asia.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">How we work</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>We start from the places plans describe, not from the plans.</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>We bring young people into decisions they will live with longest.</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>We publish our data and methods openly.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->',
            'photo' => 'photo-1509030450996-dd1a26dda07a',
        ],
        'social' => [
            [
                'platform' => 'LinkedIn',
                'href' => 'https://www.linkedin.com',
            ],
            [
                'platform' => 'Facebook',
                'href' => 'https://www.facebook.com',
            ],
            [
                'platform' => 'Instagram',
                'href' => 'https://www.instagram.com',
            ],
        ],
        'photos' => [
            'photo-1557750255-c76072a7aad1' => 'Motorbikes and pedestrians sharing a busy Vietnamese city street',
            'photo-1528127269322-539801943592' => 'Limestone karsts rising from the water of Ha Long Bay',
            'photo-1555921015-5532091f6026' => 'A narrow street in Ha Noi\'s Old Quarter lined with shopfront homes',
            'photo-1559592413-7cec4d0cae2b' => 'The Mekong Delta\'s waterways and floating market near Can Tho',
            'photo-1509030450996-dd1a26dda07a' => 'A Vietnamese city skyline at dusk',
            'photo-1583417319070-4a69db38a482' => 'Ho Chi Minh City skyline at sunset',
        ],
    ];
}
