BEGIN;

INSERT INTO bookmarks (title, url, description, rating)
VALUES
    ('Google','www.google.com','Search Engine of Choice', 5),
    ('Thinkful','www.Thinkful.com','School Site', 4),
    ('mySpace','www.myspace.com','before facebook', 3),
    ('LikeCool','www.likecool.com','Just a site to kill some time', 4),
    ('Reddit','www.reddit.com','Social Media for the most intellignt', 5),
    ('yahoo','www.yahoo.com','Search Engine for consipiracy theorists', 1),
    ('instagram','www.instagram.com','Facebook for pictures', 4),
    ('CriticalRole','www.twitch.tv/critical-role','My Fav Thing', 5)
;

COMMIT;
