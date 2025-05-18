module.exports = class AddStripeCustomerIdToUser1747553704042 {
    name = 'AddStripeCustomerIdToUser1747553704042'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "lastActiveAt" SET DEFAULT '"2025-05-18T07:35:04.331Z"'`);
        await queryRunner.query(`ALTER TABLE "Seller" ALTER COLUMN "setting" SET DEFAULT '{"notifications":{"Order_Updates":true,"Promotions_Deals":false,"New_Product_Arrivals":true,"Push_Notifications":{"Order_Status_Updates":true,"Chat_Messages":false},"Newsletter_Preferences":{"Weekly_Newsletter":true}},"shipping_Address":[{"label":"Home","isDefault":true,"name":"Sarah Johnson","address":"123 Main Street, Apt 4B","city":"New York, NY 10001","country":"United States","phone":"(555) 123-4567"},{"label":"Office","isDefault":false,"name":"Sarah Johnson","address":"456 Business Ave, Floor 12","city":"New York, NY 10002","country":"United States","phone":"(555) 987-6543"}]}'`);
        await queryRunner.query(`ALTER TABLE "Store" ALTER COLUMN "businessHours" SET DEFAULT '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 8:00 PM","saturday":"10:00 AM - 7:00 PM","sunday":"Closed"}'`);
        await queryRunner.query(`ALTER TABLE "Store" ALTER COLUMN "socialLinks" SET DEFAULT '{"instagram":"https://instagram.com/michaelsbeauty","facebook":"https://facebook.com/michaelsbeautystore","tiktok":"https://tiktok.com/@michaelsbeauty"}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Store" ALTER COLUMN "socialLinks" SET DEFAULT '{"tiktok": "https://tiktok.com/@michaelsbeauty", "facebook": "https://facebook.com/michaelsbeautystore", "instagram": "https://instagram.com/michaelsbeauty"}'`);
        await queryRunner.query(`ALTER TABLE "Store" ALTER COLUMN "businessHours" SET DEFAULT '{"friday": "9:00 AM - 8:00 PM", "monday": "9:00 AM - 6:00 PM", "sunday": "Closed", "tuesday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 7:00 PM", "thursday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM"}'`);
        await queryRunner.query(`ALTER TABLE "Seller" ALTER COLUMN "setting" SET DEFAULT '{"notifications": {"Order_Updates": true, "Promotions_Deals": false, "Push_Notifications": {"Chat_Messages": false, "Order_Status_Updates": true}, "New_Product_Arrivals": true, "Newsletter_Preferences": {"Weekly_Newsletter": true}}, "shipping_Address": [{"city": "New York, NY 10001", "name": "Sarah Johnson", "label": "Home", "phone": "(555) 123-4567", "address": "123 Main Street, Apt 4B", "country": "United States", "isDefault": true}, {"city": "New York, NY 10002", "name": "Sarah Johnson", "label": "Office", "phone": "(555) 987-6543", "address": "456 Business Ave, Floor 12", "country": "United States", "isDefault": false}]}'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "lastActiveAt" SET DEFAULT '2025-05-18 07:34:44.09'`);
    }
}
