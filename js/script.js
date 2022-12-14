//Same as document.addEventListener("DOMContentLoaded"...)
//Explain: It will only been excuted when the HTML is loaded
$(function() {

    // Same as document.querySelector("#navbarToggle").addEvenListener("blur"...)
    $('#navbarToggle').blur(function (event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            $('#collapsable-nav').collapse('hide');
        }
    })
});

(function (global) {
    var dc = {};
    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl =
        "https://davids-restaurant.herokuapp.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemUrl =
        "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";

    var insertHtml = function (selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };
    
    var showLoading = function (selector) {
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>"
        insertHtml(selector, html);
    };

    document.addEventListener("DOMContentLoaded", function (event) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            homeHtml,
            function (responseText) {
                document.querySelector("#main-content")
                    .innerHTML = responseText;
            },
            false);
    });

    var insertProperty = function (string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    };

    var switchMenuToActive = function () {
        // Remove "active" from home button
        var classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;
        // Add "active" to menu button
        classes = document.querySelector("#navMenuButton").className;
        if(classes.indexOf("active") == -1) {
            classes += " active";
            document.querySelector("#navMenuButton").className = classes;
        }
    };

    //Load the menu categories view
    dc.loadMenuCategories = function () {
        showLoading('#main-content');
        $ajaxUtils.sendGetRequest(
            allCategoriesUrl,
            buildAndShowCategoriesHTML,
            true);
        switchMenuToActive();
    };
    //Load the menu items view
    // 'categoryShort' is a short_name for a category
    dc.loadMenuItems = function (categoryShort) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            menuItemUrl + categoryShort,
            buildAndShowMenuItemsHTML,
            true);
        switchMenuToActive();
    };

    //Builds HTML for the categories page based on the data
    //From the server
    function buildAndShowCategoriesHTML (categories) {
        //Load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml,
            function(categoriesTitleHtml) {
                //Retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    categoryHtml,
                    function (categoryHtml) {
                        var categoriesViewHtml =
                            buildCategoriesViewHtml(categories,
                                                    categoriesTitleHtml,
                                                    categoryHtml);
                        insertHtml('#main-content', categoriesViewHtml);
                    },
                    false);
            },
            false);
    }
    // Builds HTML for the single categoy page based on the date from server
    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        $ajaxUtils.sendGetRequest(
            menuItemsTitleHtml,
            function (menuItemsTitleHtml) {
                $ajaxUtils.sendGetRequest (
                    menuItemHtml,
                    function (menuItemHtml) {
                        var menuItemsViewHtml =
                            buildMenuItemsViewHtml(categoryMenuItems,
                                                   menuItemsTitleHtml,
                                                   menuItemHtml);
                        insertHtml("#main-content", menuItemsViewHtml);
                    },
                    false);
            },
            false);
    }

    //Using categories data and snippets html
    //Build categories view HTML to be inserted into page
    function buildCategoriesViewHtml(categories,
                                    categoriesTitleHtml,
                                    categoryHtml) {
        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";
        for(var i = 0; i < categories.length; i++) {
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html = 
                insertProperty(html, "short_name", short_name);
            html = 
                insertProperty(html, "name", name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    function buildMenuItemsViewHtml(categoryMenuItems,
                                    menuItemsTitleHtml,
                                    menuItemHtml) {
        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                           "name",
                           categoryMenuItems.category.name);
        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                           "special_instructions",
                           categoryMenuItems.category.special_instructions);
        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";

        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for(var i = 0; i < menuItems.length; i++) {
            var html = menuItemHtml;
            html =
                insertProperty(html, "short_name", menuItems[i].short_name);
            html =
                insertProperty(html, "catShortName", catShortName);
            html =
                insertItemPrice(html, "price_small", menuItems[i].price_small);
            html =
                insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
            html =
                insertItemPrice(html, "price_large", menuItems[i].price_large);
            html =
                insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
            html =
                insertProperty(html, "name", menuItems[i].name);
            html =
                insertProperty(html, "description", menuItems[i].description);

            if(i%2 != 0) {
                html +=
                    "<div class='clearfix visible-lg-block visible-md-block'></div>";
            }
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    function insertItemPrice(html,
                             pricePropName,
                             priceValue) {
        if(!priceValue) {
            return insertProperty(html, pricePropName, "");
        }
        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }
    function insertItemPortionName(html,
                                   portionPropName,
                                   portionValue) {
        // If not specified, return original string
        if (!portionValue) {
            return insertProperty(html, portionPropName, "");
        }
        portionValue = "(" + portionValue + ")";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

    global.$dc = dc;
})(window);