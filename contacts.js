const { firefox } = require('playwright');
const fs = require('fs');

async function getContacts(outputPath) {
    // Валидация входных данных
    if (!outputPath || typeof outputPath !== 'string') {
        throw new Error('Output path must be a non-empty string');
    }

    const browser = await firefox.launch();
    const page = await browser.newPage();
    
    // Переход на главную страницу
    await page.goto('https://www.onlyoffice.com/');

    // Навигация: Resources -> Contacts
    await page.locator('a[href="/resources.aspx"]').hover();
    await page.locator('a[href="/contacts.aspx"]').click();
    await page.waitForLoadState('networkidle');

    // Парсинг офисов
    const offices = await page.locator('div.office').all();
    let csvData = 'Country;CompanyName;FullAddress\n';
    for (const office of offices) {
        const country = (await office.locator('h3').innerText()).trim();
        const company = (await office.locator('p').nth(0).innerText()).trim();
        const address = (await office.locator('p').nth(1).innerText()).trim();
        const phone = (await office.locator('p').nth(2).innerText() || '').trim();
        const fullAddress = `${address}${phone ? ' ' + phone : ''}`;
        csvData += `${country};${company};${fullAddress}\n`;
    }

    // Запись в CSV-файл
    fs.writeFileSync(outputPath, csvData);

    await browser.close();
    return csvData;
}

module.exports = { getContacts };

// Запуск скрипта из командной строки
if (require.main === module) {
    const outputPath = process.argv[2] || 'output.csv';
    getContacts(outputPath)
        .then(() => console.log(`CSV файл сохранён в ${outputPath}`))
        .catch(console.error);
}