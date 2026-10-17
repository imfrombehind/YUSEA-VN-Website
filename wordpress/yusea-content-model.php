<?php
/**
 * Plugin Name: YUSEA Content Model
 * Description: Registers the Project and Report post types, the Pillar taxonomy and their ACF fields, and adds the v2 fields to the existing Homepage and Site Settings field groups. Everything is exposed to WPGraphQL with the names the Next.js frontend queries.
 * Version:     1.0.0
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

const YUSEA_CM_VERSION = '1.0.0';

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
        ],
        'siteSettingsFields' => [
            'fields' => [
                yusea_cm_label('nav_categories_label', 'navCategoriesLabel', 'Dropdown heading: categories', 'Browse by focus'),
                yusea_cm_label('nav_quick_links_label', 'navQuickLinksLabel', 'Dropdown heading: quick links', 'Quick links'),
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
                    yusea_cm_link_rows('nav_categories', 'categories', 'Dropdown: categories'),
                    yusea_cm_link_rows('nav_quick_links', 'quickLinks', 'Dropdown: quick links'),
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

/** Adds each missing field to `$parent` (a field group or a repeater). */
function yusea_cm_add_missing($parent, $wanted, $where, &$log) {
    $existing = acf_get_fields($parent) ?: [];
    $order    = count($existing);

    foreach ($wanted as $field) {
        $name = $field['graphql_field_name'];
        if (yusea_cm_find_by_graphql_name($existing, $name, 'name')) {
            $log[] = "$where.$name already exists — left as is.";
            continue;
        }
        yusea_cm_create_field($field, $parent['ID'], $order++);
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
    }

    return $log;
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
