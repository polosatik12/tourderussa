/**
 * Скрипт для создания тестового пользователя
 *
 * Использование:
 * 1. Скопируйте этот файл на сервер в папку с бекендом
 * 2. Установите зависимости: npm install bcrypt pg
 * 3. Настройте параметры подключения к БД ниже
 * 4. Запустите: node create-test-user.js
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Настройки подключения к базе данных
// ВАЖНО: Замените эти значения на ваши реальные данные
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tour_de_russie',
  user: 'postgres',  // Замените на вашего пользователя БД
  password: 'your_password_here'  // Замените на ваш пароль БД
});

// Данные тестового пользователя
const TEST_USER = {
  email: 'test@tourderussie.ru',
  password: 'Test123!@#',
  firstName: 'Тестовый',
  lastName: 'Пользователь',
  dateOfBirth: '1990-01-01'
};

async function createTestUser() {
  console.log('🚀 Начинаем создание тестового пользователя...\n');

  try {
    // Хешируем пароль
    console.log('🔐 Хеширование пароля...');
    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
    console.log('✅ Пароль захеширован\n');

    // Создаем пользователя
    console.log('👤 Создание пользователя в таблице users...');
    const userResult = await pool.query(
      `INSERT INTO users (email, password, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE
       SET password = EXCLUDED.password, updated_at = NOW()
       RETURNING id, email, created_at`,
      [TEST_USER.email, passwordHash]
    );

    const user = userResult.rows[0];
    console.log('✅ Пользователь создан:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Создан: ${user.created_at}\n`);

    // Создаем профиль
    console.log('📝 Создание профиля в таблице profiles...');
    const profileResult = await pool.query(
      `INSERT INTO profiles (id, first_name, last_name, date_of_birth, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           date_of_birth = EXCLUDED.date_of_birth,
           updated_at = NOW()
       RETURNING id, first_name, last_name, date_of_birth`,
      [user.id, TEST_USER.firstName, TEST_USER.lastName, TEST_USER.dateOfBirth]
    );

    const profile = profileResult.rows[0];
    console.log('✅ Профиль создан:');
    console.log(`   Имя: ${profile.first_name}`);
    console.log(`   Фамилия: ${profile.last_name}`);
    console.log(`   Дата рождения: ${profile.date_of_birth}\n`);

    // Выводим итоговую информацию
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ТЕСТОВЫЙ ПОЛЬЗОВАТЕЛЬ УСПЕШНО СОЗДАН!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 Данные для входа:');
    console.log(`   Email:    ${TEST_USER.email}`);
    console.log(`   Пароль:   ${TEST_USER.password}`);
    console.log('\n🌐 Войти можно по адресу:');
    console.log('   https://tourderussie.ru/login');
    console.log('\n⚠️  ВАЖНО: Этот аккаунт только для тестирования!');
    console.log('   Не используйте его в продакшене.\n');

  } catch (error) {
    console.error('\n❌ ОШИБКА при создании пользователя:');
    console.error(error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Подсказка: Не удалось подключиться к базе данных.');
      console.error('   Проверьте, что PostgreSQL запущен и параметры подключения верны.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Подсказка: Неверный пароль для подключения к БД.');
      console.error('   Проверьте параметры подключения в начале файла.');
    } else if (error.code === '3D000') {
      console.error('\n💡 Подсказка: База данных не существует.');
      console.error('   Проверьте название базы данных в параметрах подключения.');
    } else if (error.code === '42P01') {
      console.error('\n💡 Подсказка: Таблица не существует.');
      console.error('   Убедитесь, что миграции базы данных выполнены.');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запускаем создание пользователя
createTestUser();
