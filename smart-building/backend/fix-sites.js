const Database = require('better-sqlite3');
const db = new Database('./smartbuild_v3.sqlite');

async function fix() {
    const sites = db.prepare('SELECT id, name, address, city, latitude, longitude FROM site WHERE latitude IS NULL OR longitude IS NULL').all();
    console.log(`Found ${sites.length} sites needing geocoding.`);

    for (const site of sites) {
        if (site.address) {
            try {
                const query = encodeURIComponent(`${site.address}${site.city ? ', ' + site.city : ''}`);
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
                    headers: { 'User-Agent': 'SmartBuildingApp/1.0' }
                });
                const data = await response.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    db.prepare('UPDATE site SET latitude = ?, longitude = ? WHERE id = ?').run(lat, lon, site.id);
                    console.log(`Updated ${site.name} (${site.address}): ${lat}, ${lon}`);
                } else {
                    // Address not found with nominatim - Try search with only City or simpler string
                    console.log(`Address not found: ${site.address} for ${site.name}`);
                }
            } catch (err) {
                console.error('Error fetching Nominatim: ', err);
            }
        }
    }
}

fix().catch(console.error);
