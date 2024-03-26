# ExpressJS_StarBoyPOS

StarBoyPOS is an ExpressJS-based Point of Sale (POS) system designed for store that sells mobile devices. It provides a user-friendly interface for managing inventory, processing sales, and more.

## Features

- Inventory Management: Easily add, edit, and delete mobile devices from the inventory.
- Sales Processing: Streamlined sales process for efficient customer transactions.
- User Authentication: Secure login system with role-based access control.
- Reporting: Generate reports on sales, inventory, and other metrics.

## Getting Started 
### *Dev Environment*

To get started with StarBoyPOS in **_Dev Environment_**, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/devilkun1/ExpressJS_StarBoyPOS.git

2. **Install Dependencies:**

   ```bash
   cd ExpressJS_StarBoyPOS
   npm install

3. **Add .env file:**

   ```bash
   SECRET_KEY=yJozZ6Ktk960mtt7l18eoOEUxEiRaOWw
   SESSION_KEY=5mNLMNsfCHLvjobVmLKqcrMON8iB6X4G
   MAIL_PASSWORD=rnbvordtpyvpxewu
   DOMAIN=localhost:3000
   DB_DEV_CONSTRING=mongodb+srv://admin:admin@lytuanan1911.jtassu8.mongodb.net/StarBoyPOS_dev?retryWrites=true&w=majority
   DB_PROD_CONSTRING=mongodb+srv://admin:admin@lytuanan1911.jtassu8.mongodb.net/StarBoyPOS?retryWrites=true&w=majority

4. **Run the Application:**

   ```bash
   npm start

5. **Access & Test:**

   ```bash
   localhost:3000

6. **Account provided:**

   ```bash
    Role: Admin
    username: admin
    password: admin
   
    Role: Staff
    username: kunyanan11
    password: 123123Aa@
   
7. **_Note_**
    - Requires a stable internet connection to connect to the database (Mongodb Atlas).
    - Install Nodejs (Latest LTS).
  
### *Production Environment*

To get started with StarBoyPOS in **_Production Environment_**, visit the link: [starboypos](https://starboypos.up.railway.app)

   **Account provided:**
   ```bash
    Role: Admin
    username: admin
    password: admin
