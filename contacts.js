const { firefox } = require('playwright');
const fs = require('fs');

async function getContacts(outputPath) {
    // Валидация входных данных
    if (!outputPath || typeof outputPath !== 'string') {
        throw new Error('Output path must be a non-empty string');
    }

    console.log('Launching Firefox');
    const browser = await firefox.launch({
        timeout: 30000,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    
    // Переход на главную страницу
    console.log('Navigating to https://www.onlyoffice.com/');
    try {
        await page.goto('https://www.onlyoffice.com/', { timeout: 20000 });
    } catch (error) {
        console.error('Error navigating to main page:', error.message);
        await browser.close();
        throw error;
    }

    // Навигация: Resources -> Contacts
    console.log('Hovering over Resources');
    const resources = await page.locator('#navitem_about');
    await resources.waitFor({ state: 'visible', timeout: 5000 });
    await resources.hover({ timeout: 5000 });
    console.log('Clicking Contacts');
    const contacts = await page.locator('#navitem_about_contacts');
    await contacts.waitFor({ state: 'visible', timeout: 5000 });
    await contacts.click({ timeout: 5000 });
    console.log('Waiting for page load');
    await page.waitForLoadState('load', { timeout: 10000 });

    // Ожидание видимости офисов
    console.log('Waiting for offices to be visible');
    await page.locator('div.companydata').first().waitFor({ state: 'visible', timeout: 10000 });

    // Парсинг офисов
    console.log('Parsing offices');
    const officeElements = await page.locator('div.companydata').all();
    const offices = [];
    for (const element of officeElements) {
        const classAttr = await element.getAttribute('class');
        const hasContactus = !classAttr?.includes('contactus_mails_area');
        const hasAddress = (await element.locator('span[itemprop="streetAddress"], span[itemprop="addressCountry"], span[itemprop="postalCode"]').count()) > 0;
        if (hasContactus && hasAddress) {
            offices.push(element);
        }
    }
    console.log(`Found ${offices.length} offices`);
    let csvData = 'Country;CompanyName;FullAddress\n';
    for (const office of offices) {
        try {
            const country = (await office.locator('span.region').innerText({ timeout: 5000 })).trim();
            const companyElements = await office.locator('span b, span:nth-child(2)').all();
            const company = (await companyElements[0]?.innerText({ timeout: 5000 }) || '').trim() || 'Unknown Company';
            const addressParts = await office.locator('span[itemprop="streetAddress"], span[itemprop="addressCountry"], span[itemprop="postalCode"]').allInnerTexts();
            const phone = (await office.locator('span[itemprop="telephone"]').innerText({ timeout: 5000 }).catch(() => '') || '').trim();
            const fullAddress = addressParts.join(' ').trim() + (phone ? ' ' + phone : '');
            csvData += `${country};${company};${fullAddress}\n`;
        } catch (error) {
            console.error('Error parsing office:', error.message);
            continue;
        }
    }

    // Запись в CSV-файл
    console.log('Writing to CSV');
    fs.writeFileSync(outputPath, csvData);

    console.log('Closing browser');
    await browser.close();
    return csvData;
}

module.exports = { getContacts };

// Запуск скрипта из командной строки
if (require.main === module) {
    const outputPath = process.argv[2] || 'output.csv';
    getContacts(outputPath)
        .then(() => console.log(`CSV файл сохранён в ${outputPath}`))
        .catch(error => console.error('Error:', error.message));
}