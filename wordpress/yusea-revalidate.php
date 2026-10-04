<?php
/**
 * Plugin Name: YUSEA Frontend Revalidation
 * Description: Tells the Next.js frontend to refresh its cached pages whenever content is saved, published, or trashed.
 * Version:     1.0.0
 *
 * Requires two constants in wp-config.php:
 *   define('YUSEA_FRONTEND_URL', 'https://your-nextjs-site.example');
 *   define('YUSEA_REVALIDATE_SECRET', '<same value as REVALIDATE_SECRET in Next>');
 *
 * Install either as a regular plugin (zip this file, Plugins → Add New → Upload)
 * or paste everything below the header into the Code Snippets plugin.
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
            $tags = ['projects', 'homepage'];
            break;
        case 'page':
            $tags = ['homepage'];
            break;
        default:
            return;
    }

    wp_remote_post(rtrim(YUSEA_FRONTEND_URL, '/') . '/api/revalidate', [
        'headers'  => [
            'Content-Type'        => 'application/json',
            'x-revalidate-secret' => YUSEA_REVALIDATE_SECRET,
        ],
        'body'     => wp_json_encode(['tags' => $tags]),
        'timeout'  => 5,
        // Don't make editors wait on the frontend when they click Publish.
        'blocking' => false,
    ]);
}, 10, 2);
