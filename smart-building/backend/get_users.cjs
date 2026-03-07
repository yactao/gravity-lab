const db = require('better-sqlite3')('smartbuild_v3.sqlite');

try {
    const users = db.prepare('SELECT id, email, role, organizationId FROM users').all();
    console.table(users);

    const orgs = db.prepare('SELECT id, name FROM organizations').all();
    console.table(orgs);

    // Assign the first org to admin
    if (users.length > 0 && orgs.length > 0) {
        db.prepare('UPDATE users SET organizationId = ? WHERE email = ?').run(orgs[0].id, 'admin@ubbee.fr');
        console.log('✅ Admin user linked to organization:', orgs[0].name);
    } else if (users.length === 0 && orgs.length > 0) {
        // Create admin user
        db.prepare('INSERT INTO users (id, email, password, role, name, organizationId) VALUES (?, ?, ?, ?, ?, ?)').run(
            'admin-id', 'admin@ubbee.fr', '$2a$10$wKz0b/rKzHkQK1eX6Q3qLuE0xZ6wR1K1x/QK1eX6Q3qLuE0xZ6wR1', 'SUPER_ADMIN', 'Super Admin', orgs[0].id
        );
        console.log('✅ Admin user created and linked to organization:', orgs[0].name);
    }
} catch (e) {
    console.log(e);
}
