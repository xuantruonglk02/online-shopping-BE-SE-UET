-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2022 at 09:14 AM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clothing_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `cart_has_products`
--

CREATE TABLE `cart_has_products` (
  `cartId` int(11) NOT NULL,
  `productId` varchar(8) NOT NULL,
  `sizeId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `status` varchar(15) NOT NULL DEFAULT 'preparing',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `order_has_products`
--

CREATE TABLE `order_has_products` (
  `orderId` int(11) NOT NULL,
  `productId` varchar(8) NOT NULL,
  `sizeId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Triggers `order_has_products`
--
DELIMITER $$
CREATE TRIGGER `after_delete_order_has_products` AFTER DELETE ON `order_has_products` FOR EACH ROW BEGIN
	UPDATE product_has_sizes
		SET quantity = quantity + OLD.quantity
		WHERE productId = OLD.productId AND sizeId = OLD.sizeId;
    UPDATE products
    	SET sold = sold - OLD.quantity
        WHERE productId = OLD.productId;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_order_has_products` AFTER INSERT ON `order_has_products` FOR EACH ROW BEGIN
	UPDATE product_has_sizes
		SET quantity = quantity - NEW.quantity
		WHERE productId = NEW.productId AND sizeId = NEW.sizeId;
    UPDATE products
    	SET sold = sold + NEW.quantity
        WHERE productId = NEW.productId;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `preview_images`
--

CREATE TABLE `preview_images` (
  `productId` varchar(8) NOT NULL,
  `url` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(8) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `price` int(11) NOT NULL,
  `sold` int(11) NOT NULL DEFAULT 0,
  `quantityOfRating` int(11) NOT NULL DEFAULT 0,
  `rating` float DEFAULT NULL,
  `description` varchar(5000) NOT NULL,
  `thumbnail` varchar(200) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL,
  `parentId` int(11) DEFAULT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `product_has_sizes`
--

CREATE TABLE `product_has_sizes` (
  `productId` varchar(8) NOT NULL,
  `sizeId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` varchar(8) NOT NULL,
  `star` int(11) NOT NULL,
  `comment` varchar(500) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Triggers `ratings`
--
DELIMITER $$
CREATE TRIGGER `after_insert_rating` AFTER INSERT ON `ratings` FOR EACH ROW BEGIN
	UPDATE products
    	SET quantityOfRating = quantityOfRating + 1
        WHERE productId = NEW.productId;
    UPDATE products
    	SET rating = (SELECT AVG(star) FROM ratings WHERE productId = NEW.productId)
        WHERE productId = NEW.productId;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `id` int(11) NOT NULL,
  `text` varchar(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `cartId` int(11) NOT NULL,
  `role` varchar(8) NOT NULL,
  `name` varchar(30) NOT NULL,
  `phoneNumber` varchar(11) NOT NULL,
  `email` varchar(30) DEFAULT NULL,
  `password` char(60) NOT NULL,
  `address` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `email` varchar(30) NOT NULL,
  `type` varchar(20) NOT NULL,
  `token` char(60) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cart_has_products`
--
ALTER TABLE `cart_has_products`
  ADD PRIMARY KEY (`cartId`,`productId`,`sizeId`),
  ADD KEY `fk_Cart_has_Products_Carts1` (`cartId`) USING BTREE,
  ADD KEY `fk_Cart_has_Products_Sizes1` (`sizeId`) USING BTREE,
  ADD KEY `fk_Cart_has_Products_Products1` (`productId`) USING BTREE;

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_Orders_Users1` (`userId`) USING BTREE;

--
-- Indexes for table `order_has_products`
--
ALTER TABLE `order_has_products`
  ADD PRIMARY KEY (`orderId`,`productId`,`sizeId`),
  ADD KEY `fk_Order_has_Products_Sizes1` (`sizeId`) USING BTREE,
  ADD KEY `fk_Order_has_Products_Orders1` (`orderId`) USING BTREE,
  ADD KEY `fk_Order_has_Products_Products1` (`productId`) USING BTREE;

--
-- Indexes for table `preview_images`
--
ALTER TABLE `preview_images`
  ADD KEY `fk_Preview_Images_Products1` (`productId`) USING BTREE;

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_Products_Product_Categories1` (`categoryId`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_Product_Categories_Product_Categories1` (`parentId`) USING BTREE;

--
-- Indexes for table `product_has_sizes`
--
ALTER TABLE `product_has_sizes`
  ADD PRIMARY KEY (`productId`,`sizeId`),
  ADD KEY `fk_Product_has_Sizes_Products1` (`productId`) USING BTREE,
  ADD KEY `fk_Product_has_Sizes_Sizes1` (`sizeId`) USING BTREE;

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_Ratings_Users1` (`userId`) USING BTREE,
  ADD KEY `fk_Ratings_Products1` (`productId`) USING BTREE;

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_Users_Carts` (`cartId`) USING BTREE;

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_User_Tokens_Users` (`userId`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_has_products`
--
ALTER TABLE `cart_has_products`
  ADD CONSTRAINT `fk_Cart_has_Products_Carts1` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`),
  ADD CONSTRAINT `fk_Cart_has_Products_Products1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_Cart_has_Products_Sizes1` FOREIGN KEY (`sizeId`) REFERENCES `sizes` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_Orders_Users1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_has_products`
--
ALTER TABLE `order_has_products`
  ADD CONSTRAINT `fk_Order_has_Products_Orders1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `fk_Order_has_Products_Products1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_Order_has_Products_Sizes1` FOREIGN KEY (`sizeId`) REFERENCES `sizes` (`id`);

--
-- Constraints for table `preview_images`
--
ALTER TABLE `preview_images`
  ADD CONSTRAINT `fk_Preview_Images_Products1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_Products_Product_Categories1` FOREIGN KEY (`categoryId`) REFERENCES `product_categories` (`id`);

--
-- Constraints for table `product_has_sizes`
--
ALTER TABLE `product_has_sizes`
  ADD CONSTRAINT `fk_Product_has_Sizes_Products1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_Product_has_Sizes_Sizes1` FOREIGN KEY (`sizeId`) REFERENCES `sizes` (`id`);

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `fk_Ratings_Products1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_Ratings_Users1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_Users_Carts` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`);

--
-- Constraints for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `fk_User_Tokens_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
