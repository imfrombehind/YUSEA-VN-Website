<?php
/**
 * Plugin Name: YUSEA Frontend Revalidation
 * Description: Tells the Next.js frontend to refresh its cached pages whenever content is saved, published, or trashed.
 * Version:     1.2.0
 *
 * Requires two constants in wp-config.php:
 *   define('YUSEA_FRONTEND_URL', 'https://your-nextjs-site.example');
 *   define('YUSEA_REVALIDATE_SECRET', '<same value as REVALIDATE_SECRET in Next>');
 *
 * Install either as a regular plugin (zip this file, Plugins → Add New → Upload)
 * or paste everything below the header into the Code Snippets plugin.
 *
 * Tools → Refresh website shows whether it is set up, the frontend's answer
 * to the last refresh, and a button to refresh the whole site.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('save_post', function ($post_id, $post) {
    if (!defined('YUSEA_FRONTEND_URL') || !defined('YUSEA_REVALIDATE_SECRET')) {
        return;
    }
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    if ($post->post_status === 'auto-draft') {
        return;
    }

    // Must match the cache tags in lib/cms/index.ts.
    switch ($post->post_type) {
        case 'post':
            $tags = ['posts', 'post:' . $post->post_name];
            break;
        case 'project':
            $tags = ['projects', 'project:' . $post->post_name];
            break;
        case 'report':
            $tags = ['reports', 'report:' . $post->post_name];
            break;
        case 'page':
            $tags = ['homepage', 'pages'];
            break;
        default:
            return;
    }

    yusea_revalidate($tags);
}, 10, 2);

/**
 * Asks the frontend to purge `$tags` (empty: every tag) and stores its
 * answer for Tools → Refresh website. Blocking on purpose: a non-blocking
 * request over HTTPS is often dropped before it is sent, so the site never
 * hears about the save. The frontend answers in well under a second.
 */
function yusea_revalidate(array $tags) {
    if (!defined('YUSEA_FRONTEND_URL') || !defined('YUSEA_REVALIDATE_SECRET')) {
        return null;
    }

    $response = wp_remote_post(rtrim(YUSEA_FRONTEND_URL, '/') . '/api/revalidate', [
        'headers' => [
            'Content-Type'        => 'application/json',
            'x-revalidate-secret' => YUSEA_REVALIDATE_SECRET,
        ],
        'body'    => wp_json_encode($tags ? ['tags' => array_values($tags)] : new stdClass()),
        'timeout' => 5,
    ]);

    $result = is_wp_error($response)
        ? ['ok' => false, 'detail' => 'Could not reach the website: ' . $response->get_error_message()]
        : [
            'ok'     => wp_remote_retrieve_response_code($response) === 200,
            'detail' => wp_remote_retrieve_response_code($response) . ' ' . wp_remote_retrieve_body($response),
        ];
    $result['time'] = current_time('mysql');
    $result['tags'] = $tags ? implode(', ', $tags) : 'everything';
    update_option('yusea_revalidate_last', $result, false);
    return $result;
}

add_action('admin_menu', function () {
    add_management_page('Refresh website', 'Refresh website', 'edit_posts', 'yusea-refresh', 'yusea_revalidate_page');
});

function yusea_revalidate_page() {
    $configured = defined('YUSEA_FRONTEND_URL') && defined('YUSEA_REVALIDATE_SECRET');
    $last       = get_option('yusea_revalidate_last');

    echo '<div class="wrap"><h1>Refresh website</h1>';
    echo '<p style="max-width:760px">Saving a post, project, report, page or pillar tells the website to refresh it. If a change does not show up, refresh the whole site here.</p>';

    if (!$configured) {
        echo '<div class="notice notice-error inline"><p><strong>Not set up.</strong> Add <code>YUSEA_FRONTEND_URL</code> and <code>YUSEA_REVALIDATE_SECRET</code> to wp-config.php (see the plugin file).</p></div>';
    } else {
        printf('<p>Website: <code>%s</code></p>', esc_html(YUSEA_FRONTEND_URL));
    }

    if (is_array($last)) {
        printf(
            '<div class="notice notice-%s inline"><p><strong>Last refresh (%s), %s:</strong> %s</p>%s</div>',
            $last['ok'] ? 'success' : 'error',
            esc_html($last['tags']),
            esc_html($last['time']),
            $last['ok'] ? 'worked.' : 'failed.',
            '<p><code>' . esc_html($last['detail']) . '</code></p>' .
                (!$last['ok'] && strpos($last['detail'], '401') === 0
                    ? '<p>401 means the secret in wp-config.php does not match <code>REVALIDATE_SECRET</code> in Vercel. Copy it again with no spaces, then redeploy on Vercel if you changed it there.</p>'
                    : '')
        );
    }

    if ($configured) {
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('yusea_refresh');
        echo '<input type="hidden" name="action" value="yusea_refresh">';
        submit_button('Refresh the whole website now', 'primary', 'submit', false);
        echo '</form>';
    }
    echo '</div>';
}

add_action('admin_post_yusea_refresh', function () {
    if (!current_user_can('edit_posts')) {
        wp_die('You are not allowed to do this.');
    }
    check_admin_referer('yusea_refresh');
    yusea_revalidate([]);
    wp_safe_redirect(admin_url('tools.php?page=yusea-refresh'));
    exit;
});

// Pillar terms feed the homepage Our Focus cards and the /work filters.
foreach (['saved_pillar', 'delete_pillar'] as $hook) {
    add_action($hook, function () {
        yusea_revalidate(['pillars']);
    });
}
