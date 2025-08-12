const { test, expect } = require('@playwright/test');
const { getContacts } = require('./contacts');

test.describe('Contacts Parser', () => {
    test('should generate correct CSV for offices', async ({ page }) => {
        // Mock страниц
        await page.route('https://www.onlyoffice.com/', async (route) => {
            route.continue();
        });
        await page.route('https://www.onlyoffice.com/contacts.aspx', async (route) => {
            const mockHtml = `
            <html>
            <body>
                <div class="office">
                    <h3>U.S.A.</h3>
                    <p>Ascensio Systems Inc</p>
                    <p>13355 Noel Rd Suite 1100 Dallas, TX, USA 75240</p>
                    <p>Phone: +1 (972) 301-8440</p>
                </div>
                <div class="office">
                    <h3>Latvia</h3>
                    <p>Ascensio System SIA</p>
                    <p>20A-6 Ernesta Birznieka-Upish street, Riga, Latvia, EU, LV-1050</p>
                    <p>Phone: +371 63399867</p>
                </div>
            </body>
            </html>`;
            route.fulfill({ body: mockHtml });
        });

        // Запуск функции
        const csvData = await getContacts('test_output.csv');

        const expectedCSV = 
`Country;CompanyName;FullAddress
U.S.A.;Ascensio Systems Inc;13355 Noel Rd Suite 1100 Dallas, TX, USA 75240 Phone: +1 (972) 301-8440
Latvia;Ascensio System SIA;20A-6 Ernesta Birznieka-Upish street, Riga, Latvia, EU, LV-1050 Phone: +371 63399867
`;

        expect(csvData).toBe(expectedCSV);
        expect(require('fs').readFileSync('test_output.csv', 'utf8')).toBe(expectedCSV);
    });

    test('should throw error for invalid output path', async () => {
        await expect(getContacts('')).rejects.toThrow('Output path must be a non-empty string');
        await expect(getContacts(null)).rejects.toThrow('Output path must be a non-empty string');
    });
}); 