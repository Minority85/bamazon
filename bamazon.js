const inquirer = require('inquirer');
const mysql = require("mysql");
var sql = "SELECT * FROM ?? WHERE ??";
var idHolder;
var numberHolder;
var quantityHolder;
var totalPrice;

const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Chloe@85",
    database: "bamazon_db"
});

connection.connect(function (error) {
    if (error) {
        console.log(error);
        return;
    }

    console.log("Connected");
    console.log("====================================");
    console.log("      #----------------------#");
    console.log("      # Items For Sale Today #");
    console.log("      #----------------------#");
    console.log("====================================");

    runStart();
});

function runStart() {

    var inserts = ['products', 'item_id'];
    sql = mysql.format(sql, inserts);

    connection.query(sql, function (error, results, fields) {

        if (error) {
            console.log(error);
            return;
        }

        // console.log(results);
        // console.log(fields);

        for (var i = 0; i < results.length; i++) {
            console.log("Item ID: " + results[i].item_id);
            console.log("Product: " + results[i].product_name);
            console.log("Department: " + results[i].department_name);
            console.log("Price: $" + results[i].price);
            console.log("In Stock: " + results[i].stock_quantity);
            console.log("====================================");
        }

        var questions = [
            {
                type: 'input',
                name: 'productID',
                message: "Please provide the ID of the product you would like to buy.",
                validate: function (value) {

                    // console.log(value);

                    var pass = false;

                    var holder = parseInt(value);

                    // if EXISTS('SELECT `id` FROM `products` WHERE `id` = ?', [holder], function (error, results, fields) {

                    // })

                    for (var i = 0; i < results.length; i++) {

                        if (results[i].item_id === holder) {

                            pass = true;

                        }
                        else {

                        }
                    };

                    if (pass) {
                        return true;
                    };

                    return 'Please submit a valid ID.';
                }
            },
        ];

        inquirer.prompt(questions).then(answers => {

            idHolder = parseInt(answers.productID);

            var question2 = [
                {
                    type: 'input',
                    name: 'quantity',
                    message: "Please provide the amount in units you would like to buy?",
                    validate: function (value) {

                        // console.log(value);

                        var pass = false;

                        var holder = parseInt(value);

                        for (var i = 0; i < results.length; i++) {

                            if (results[i].item_id === idHolder) {

                                if (holder > results[i].stock_quantity || results[i].stock_quantity === 0) {

                                }
                                else {

                                    pass = true;

                                }
                            }
                            else {

                            }
                        };

                        if (pass) {
                            return true;
                        };

                        return 'Insufficient product quantity available for purchase. Please choose another amount.';
                    }
                }
            ];

            inquirer.prompt(question2).then(answers => {

                numberHolder = parseInt(answers.quantity);

                // console.log(numberHolder);
                // console.log(idHolder);

                for (var i = 0; i < results.length; i++) {

                    if (results[i].item_id === idHolder) {

                        quantityHolder = results[i].stock_quantity;

                        quantityHolder -= numberHolder;

                        var price = results[i].price;

                        price *= numberHolder;

                        totalPrice = price.toFixed(2);
                    }
                }

                change();
            });
        });
    })
}

function change() {

    connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [quantityHolder, idHolder], function (error, results, fields) {

        if (error) {
            console.log(error);
            return;
        };

        final();
    });
}

function final() {

    connection.query(sql, function (error, results, fields) {

        if (error) {
            console.log(error);
            return;
        };

        for (var i = 0; i < results.length; i++) {

            if (results[i].item_id === idHolder) {

                console.log("====================================");
                console.log("Item ID: " + results[i].item_id);
                console.log("Product: " + results[i].product_name);
                console.log("Department: " + results[i].department_name);
                console.log("Price: $" + results[i].price);
                console.log("In Stock: " + results[i].stock_quantity);
                console.log("====================================");

            }
        };

        console.log("Your total is: $" + totalPrice);
        console.log("====================================");

        inquirer
            .prompt([
                {
                    type: 'confirm',
                    name: 'check',
                    message: 'Would you like to buy more?',
                }
            ])
            .then(answers => {
                
                if (answers.check) {
                    runStart();
                }
                else if (!answers.check) {
                    endRun();
                }
                else {
                    console.log("ERROR!");
                }
            });
    })
}

function endRun() {
    connection.end(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log("Goodbye!");

    });
}