const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'food_ordering'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to database...');

    // Drop tables if they exist to start fresh
    await client.query(`
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS menu_items;
      DROP TABLE IF EXISTS restaurants;
      DROP TABLE IF EXISTS users;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE restaurants (
        restaurant_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE menu_items (
        item_id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE orders (
        order_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'placed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE order_items (
        order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES menu_items(item_id),
        quantity INTEGER NOT NULL,
        PRIMARY KEY (order_id, item_id)
      );
    `);
    console.log('Tables created successfully.');

    // Insert sample restaurants
    const insertRestaurantsQuery = `
      INSERT INTO restaurants (restaurant_id, name, location) VALUES
      (1, 'Burger King', 'Downtown New York'),
      (2, 'Pizza Hut', 'Brooklyn'),
      (3, 'Sushi Place', 'Manhattan')
    `;
    await client.query(insertRestaurantsQuery);
    console.log('Sample restaurants inserted.');

    // Insert sample menu items
    const insertMenuItemsQuery = `
      INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
      (1, 'Whopper', 'Flame-grilled beef burger', 5.99),
      (1, 'Fries', 'Crispy golden fries', 2.49),
      (2, 'Pepperoni Pizza', 'Large pepperoni pizza', 14.99),
      (2, 'Garlic Bread', 'Warm garlic bread', 4.99),
      (3, 'California Roll', 'Crab, avocado, cucumber', 8.99),
      (3, 'Spicy Tuna', 'Spicy tuna roll', 9.99)
    `;
    await client.query(insertMenuItemsQuery);
    console.log('Sample menu items inserted.');

    // Update sequence since we manually provided IDs for restaurants
    await client.query("SELECT setval('restaurants_restaurant_id_seq', (SELECT MAX(restaurant_id) FROM restaurants))");

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

seed();
