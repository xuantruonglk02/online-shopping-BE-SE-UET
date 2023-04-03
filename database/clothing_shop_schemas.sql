-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th7 07, 2022 lúc 10:00 PM
-- Phiên bản máy phục vụ: 5.7.33-cll-lve
-- Phiên bản PHP: 7.3.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `clothing_shop`
--
DROP DATABASE IF EXISTS `clothing_shop`;
CREATE DATABASE `clothing_shop`;
USE `clothing_shop`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bills`
--

CREATE TABLE `bills` (
  `bill_id` varchar(13) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL DEFAULT '1',
  `user_name` varchar(30) NOT NULL,
  `user_phone` varchar(11) NOT NULL,
  `user_address` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bill_has_product`
--

CREATE TABLE `bill_has_product` (
  `bill_id` varchar(13) NOT NULL,
  `product_id` varchar(8) NOT NULL,
  `size_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Bẫy `bill_has_product`
--
DELIMITER $$
CREATE TRIGGER `after_delete_bill_has_product` AFTER DELETE ON `bill_has_product` FOR EACH ROW BEGIN
	UPDATE product_has_size
		SET quantity = quantity + OLD.quantity
		WHERE product_id = OLD.product_id AND size_id = OLD.size_id;
    UPDATE products
    	SET sold = sold - OLD.quantity
        WHERE product_id = OLD.product_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_bill_has_product` AFTER INSERT ON `bill_has_product` FOR EACH ROW BEGIN
	UPDATE product_has_size
		SET quantity = quantity - NEW.quantity
		WHERE product_id = NEW.product_id AND size_id = NEW.size_id;
    UPDATE products
    	SET sold = sold + NEW.quantity
        WHERE product_id = NEW.product_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `cart_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_has_product`
--

CREATE TABLE `cart_has_product` (
  `cart_id` int(11) NOT NULL,
  `product_id` varchar(8) NOT NULL,
  `size_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Bẫy `cart_has_product`
--
DELIMITER $$
CREATE TRIGGER `after_delete_product_in_cart` AFTER DELETE ON `cart_has_product` FOR EACH ROW BEGIN
	UPDATE carts
		SET quantity = quantity - 1
        WHERE cart_id = OLD.cart_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_product_to_cart` AFTER INSERT ON `cart_has_product` FOR EACH ROW BEGIN
	UPDATE carts
		SET quantity = quantity + 1
        WHERE cart_id = NEW.cart_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_statuses`
--

CREATE TABLE `order_statuses` (
  `id` int(11) NOT NULL,
  `status` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `preview_images`
--

CREATE TABLE `preview_images` (
  `product_id` varchar(8) NOT NULL,
  `url` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `product_id` varchar(8) NOT NULL,
  `line_id` varchar(15) NOT NULL,
  `class_id` varchar(15) NOT NULL,
  `name` varchar(50) NOT NULL,
  `price` int(11) NOT NULL,
  `sold` int(11) NOT NULL DEFAULT '0',
  `quantity_of_rating` int(11) NOT NULL DEFAULT '0',
  `rating` float DEFAULT NULL,
  `description` varchar(5000) NOT NULL,
  `thumbnail` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Bẫy `products`
--
DELIMITER $$
CREATE TRIGGER `after_delete_product` AFTER DELETE ON `products` FOR EACH ROW BEGIN
	UPDATE product_classes
		SET quantity = quantity - 1
		WHERE class_id = OLD.class_id;
    UPDATE product_lines
		SET quantity = quantity - 1
		WHERE line_id = OLD.line_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_product` AFTER INSERT ON `products` FOR EACH ROW BEGIN
	UPDATE product_classes
		SET quantity = quantity + 1
		WHERE class_id = NEW.class_id;
    UPDATE product_lines
		SET quantity = quantity + 1
		WHERE line_id = NEW.line_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_classes`
--

CREATE TABLE `product_classes` (
  `class_id` varchar(15) NOT NULL,
  `name` varchar(15) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_has_size`
--

CREATE TABLE `product_has_size` (
  `product_id` varchar(8) NOT NULL,
  `size_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_lines`
--

CREATE TABLE `product_lines` (
  `line_id` varchar(15) NOT NULL,
  `class_id` varchar(15) NOT NULL,
  `name` varchar(15) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` varchar(8) NOT NULL,
  `star` int(11) NOT NULL,
  `comment` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Bẫy `ratings`
--
DELIMITER $$
CREATE TRIGGER `after_insert_rating` AFTER INSERT ON `ratings` FOR EACH ROW BEGIN
	UPDATE products
    	SET quantity_of_rating = quantity_of_rating + 1
        WHERE product_id = NEW.product_id;
    UPDATE products
    	SET rating = (SELECT AVG(star) FROM ratings WHERE product_id = NEW.product_id)
        WHERE product_id = NEW.product_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reset_password_token`
--

CREATE TABLE `reset_password_token` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(30) NOT NULL,
  `token` char(60) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sizes`
--

CREATE TABLE `sizes` (
  `size_id` int(11) NOT NULL,
  `text` varchar(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(30) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `email` varchar(30) DEFAULT NULL,
  `password` char(60) NOT NULL,
  `address` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `verify_email`
--

CREATE TABLE `verify_email` (
  `id` int(11) NOT NULL,
  `email` varchar(30) NOT NULL,
  `token` char(60) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `fk_bill_user1` (`user_id`),
  ADD KEY `fk_bill_order_status1` (`status_id`);

--
-- Chỉ mục cho bảng `bill_has_product`
--
ALTER TABLE `bill_has_product`
  ADD PRIMARY KEY (`bill_id`,`product_id`,`size_id`),
  ADD KEY `fk_bill_has_product_bill1` (`bill_id`),
  ADD KEY `fk_bill_has_product_product1` (`product_id`),
  ADD KEY `fk_bill_has_product_size1` (`size_id`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`);

--
-- Chỉ mục cho bảng `cart_has_product`
--
ALTER TABLE `cart_has_product`
  ADD PRIMARY KEY (`cart_id`,`product_id`,`size_id`),
  ADD KEY `fk_cart_has_product_cart1` (`cart_id`),
  ADD KEY `fk_cart_has_product_product1` (`product_id`),
  ADD KEY `fk_cart_has_product_size1` (`size_id`);

--
-- Chỉ mục cho bảng `order_statuses`
--
ALTER TABLE `order_statuses`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `preview_images`
--
ALTER TABLE `preview_images`
  ADD KEY `fk_preview_image_product1` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `fk_product_class1` (`class_id`),
  ADD KEY `fk_product_line1` (`line_id`);

--
-- Chỉ mục cho bảng `product_classes`
--
ALTER TABLE `product_classes`
  ADD PRIMARY KEY (`class_id`);

--
-- Chỉ mục cho bảng `product_has_size`
--
ALTER TABLE `product_has_size`
  ADD PRIMARY KEY (`product_id`,`size_id`),
  ADD KEY `fk_product_has_size_product1` (`product_id`),
  ADD KEY `fk_product_has_size_size1` (`size_id`);

--
-- Chỉ mục cho bảng `product_lines`
--
ALTER TABLE `product_lines`
  ADD PRIMARY KEY (`line_id`),
  ADD KEY `fk_line_class1` (`class_id`);

--
-- Chỉ mục cho bảng `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`,`user_id`,`product_id`),
  ADD KEY `fk_rating_user1` (`user_id`),
  ADD KEY `fk_rating_product1` (`product_id`);

--
-- Chỉ mục cho bảng `reset_password_token`
--
ALTER TABLE `reset_password_token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reset_password_token_users` (`user_id`);

--
-- Chỉ mục cho bảng `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`size_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_user_cart` (`cart_id`);

--
-- Chỉ mục cho bảng `verify_email`
--
ALTER TABLE `verify_email`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `order_statuses`
--
ALTER TABLE `order_statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `ratings`
--
ALTER TABLE `ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `reset_password_token`
--
ALTER TABLE `reset_password_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sizes`
--
ALTER TABLE `sizes`
  MODIFY `size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `verify_email`
--
ALTER TABLE `verify_email`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `fk_order_status1` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`id`),
  ADD CONSTRAINT `fk_user1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `bill_has_product`
--
ALTER TABLE `bill_has_product`
  ADD CONSTRAINT `fk_bill_has_product_bill1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`),
  ADD CONSTRAINT `fk_bill_has_product_product1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_bill_has_product_size1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`);

--
-- Các ràng buộc cho bảng `cart_has_product`
--
ALTER TABLE `cart_has_product`
  ADD CONSTRAINT `fk_cart_has_product_cart1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`),
  ADD CONSTRAINT `fk_cart_has_product_product1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_cart_has_product_size1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`);

--
-- Các ràng buộc cho bảng `preview_images`
--
ALTER TABLE `preview_images`
  ADD CONSTRAINT `fk_preview_image_product1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_class1` FOREIGN KEY (`class_id`) REFERENCES `product_classes` (`class_id`),
  ADD CONSTRAINT `fk_product_line1` FOREIGN KEY (`line_id`) REFERENCES `product_lines` (`line_id`);

--
-- Các ràng buộc cho bảng `product_has_size`
--
ALTER TABLE `product_has_size`
  ADD CONSTRAINT `fk_product_has_size_product1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_product_has_size_size1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`);

--
-- Các ràng buộc cho bảng `product_lines`
--
ALTER TABLE `product_lines`
  ADD CONSTRAINT `fk_line_class1` FOREIGN KEY (`class_id`) REFERENCES `product_classes` (`class_id`);

--
-- Các ràng buộc cho bảng `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `fk_rating_product1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_rating_user1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
