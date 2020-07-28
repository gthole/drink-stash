CREATE VIEW IF NOT EXISTS drinks_activity AS
SELECT
    r.id id,
    r.created created,
    r.id recipe_id,
    null user_list_id,
    r.added_by_id user_id,
    null body,
    'recipe' activity_type,
    row_count
FROM
    drinks_recipe r
INNER JOIN (
    SELECT
        MAX(sr.id) id,
        substr(MAX(sr.created), 0, 14) timegroup,
        COUNT(*) as row_count
    FROM drinks_recipe sr
    GROUP BY
        sr.added_by_id,
        substr(sr.created, 0, 14)
) inner_r ON inner_r.id = r.id
UNION ALL
SELECT
    ulr.id id,
    ulr.created created,
    ulr.recipe_id recipe_id,
    ul.id user_list_id,
    ul.user_id user_id,
    null body,
    'listrecipe' activity_type,
    row_count
FROM
    drinks_userlistrecipe ulr
INNER JOIN (
    SELECT
        MAX(sulr.id) id,
        substr(MAX(sulr.created), 0, 14) timegroup,
        COUNT(*) as row_count
    FROM drinks_userlistrecipe sulr
    INNER JOIN
        drinks_userlist sul ON sulr.user_list_id = sul.id
    GROUP BY
        sul.user_id,
        substr(sulr.created, 0, 14)
) inner_ulr ON inner_ulr.id = ulr.id
INNER JOIN drinks_userlist ul ON ulr.user_list_id = ul.id
UNION ALL
SELECT
    c.id id,
    c.created created,
    c.recipe_id recipe_id,
    null user_list_id,
    c.user_id user_id,
    c.text body,
    'comment' activity_type,
    1 row_count
FROM drinks_comment c
ORDER BY created DESC
