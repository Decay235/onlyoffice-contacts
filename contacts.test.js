const { test, expect } = require('@playwright/test');
const { getContacts } = require('./contacts');

// Настройка Playwright для использования Firefox
test.use({ browserName: 'firefox' });

test.describe('Contacts Parser', () => {
    test('should generate correct CSV for offices', async ({ page }) => {
        // Увеличение таймаута для теста
        test.setTimeout(60000);

        // Логирование для диагностики
        console.log('Starting test: should generate correct CSV for offices');

        // Запуск функции
        console.log('Calling getContacts');
        const csvData = await getContacts('test_output.csv');
        console.log('getContacts completed, CSV:', csvData);

        const expectedCSV = 
`Country;CompanyName;FullAddress
Singapore;ONLYOFFICE Capital Group Pte. Ltd.;68 Circular Road, #02-01, Singapore 049422 Phone: +65 31656735
U.S.A.;Ascensio Systems Inc;13355 Noel Rd Suite 1100 Dallas, TX, USA 75240 Phone: +1 (972) 301-8440
Latvia;Ascensio System SIA;20A-6 Ernesta Birznieka-Upish street, Riga, Latvia, EU, LV-1050 Phone: +371 63399867
United Kingdom;Ascensio System Ltd;Suite 12, 2nd Floor, Queens House, 180 Tottenham Court Road, London, United Kingdom, W1T 7PD Phone: +44 20 3287 1086
Armenia;Ascensio Systems LLC;48/2, Garegin Nzhdeh street, Yerevan, 0026, Armenia Phone: +374 33351015
Singapore;Ascensio Systems Pte. Ltd;68 Circular Road, #02-01, Singapore 049422 Phone: +65 31656735
Uzbekistan;Ascensio System;Mustakillik avenue 6/7, Mirzo-Ulugbek district Tashkent, Uzbekistan 100000
Serbia;Ascensio Systems d.o.o. Beograd;Stevana Filipovića 113, Čukarica, Belgrade, Serbia Phone: + 381643506512
China;Ascensio Information Technologies (Shanghai) Co. Ltd.;Unit 303, No. 43, Guoqing Road Jing'an District, Shanghai, China
`;

        expect(csvData).toBe(expectedCSV);
        expect(require('fs').readFileSync('test_output.csv', 'utf8')).toBe(expectedCSV);
    });

    test('should throw error for invalid output path', async () => {
        await expect(getContacts('')).rejects.toThrow('Output path must be a non-empty string');
        await expect(getContacts(null)).rejects.toThrow('Output path must be a non-empty string');
    });
});