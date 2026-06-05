# Database And Permissions Plan

推荐使用 Supabase。

核心能力：

- Supabase Auth: 作者和管理员登录
- Supabase Postgres: 保存作者、商品、申请、点击数据
- Supabase Storage: 保存作者头像、商品图片
- Row Level Security: 限制作者只能管理自己的资料和商品

## 1. 数据表概览

```text
profiles
applications
artists
products
product_images
clicks
featured_products
```

## 2. profiles

用途：保存登录用户的基础身份。

字段：

```text
id uuid primary key
email text not null
role text not null default 'artist'
created_at timestamp
updated_at timestamp
```

role 可选值：

```text
artist
admin
```

## 3. applications

用途：保存作者入驻申请。

字段：

```text
id uuid primary key
brand_name text not null
contact_name text
email text not null
country text
city text
instagram_url text
website_url text
contact_link_label text
shop_url text
categories text[]
accepts_custom boolean default false
ships_international boolean default false
price_range text
bio text
sample_image_urls text[]
authorization_accepted boolean not null default false
status text not null default 'submitted'
admin_notes text
created_at timestamp
updated_at timestamp
```

status 可选值：

```text
submitted
reviewing
needs_info
approved
rejected
```

## 4. artists

用途：审核通过后的作者公开资料。

字段：

```text
id uuid primary key
user_id uuid references profiles(id)
application_id uuid references applications(id)
brand_name text not null
slug text unique not null
bio text
country text
city text
avatar_url text
banner_url text
instagram_url text
website_url text
shop_url text
categories text[]
accepts_custom boolean default false
ships_international boolean default false
status text not null default 'approved'
created_at timestamp
updated_at timestamp
```

status 可选值：

```text
approved
hidden
suspended
```

## 5. products

用途：保存作者上传的商品。

字段：

```text
id uuid primary key
artist_id uuid references artists(id)
title text not null
slug text not null
description text
category text
price_text text
external_url text not null
status text not null default 'approved'
is_featured boolean default false
admin_notes text
created_at timestamp
updated_at timestamp
```

status 可选值：

```text
draft
pending
approved
needs_changes
hidden
```

MVP publishing rule: approved artists can publish products directly. Product review status values remain available for future moderation, but the default product status is `approved`.

规则：

```text
每个 artist_id 最多 30 个 products
只有 approved 商品能在前台显示
external_url 必填
```

## 6. product_images

用途：一个商品多张图。

字段：

```text
id uuid primary key
product_id uuid references products(id)
image_url text not null
alt_text text
sort_order integer default 0
created_at timestamp
```

建议限制：

```text
每个商品最多 8 张图片
产品图片每张必须小于 2MB
```

## 7. clicks

用途：记录用户点击外部购买链接。

字段：

```text
id uuid primary key
artist_id uuid references artists(id)
product_id uuid references products(id)
target_url text not null
source_page text
created_at timestamp
```

注意：

第一版不需要记录用户身份，避免隐私复杂度。

## 8. featured_products

用途：管理首页 Favorite Finds。

字段：

```text
id uuid primary key
product_id uuid references products(id)
title_override text
subtitle_override text
image_override_url text
image_override_alt text
image_position text
sort_order integer default 0
starts_at timestamp
ends_at timestamp
is_active boolean default true
created_at timestamp
updated_at timestamp
```

## 9. 权限规则

### 普通访客

可以读取：

- approved artists
- approved products
- active featured_products

不能写入：

- artists
- products
- clicks 以外的数据

可以写入：

- applications
- clicks

### 作者

可以读取：

- 自己的 artist 资料
- 自己的 products
- 自己商品的 clicks 汇总

可以写入：

- 自己的 artist 资料部分字段
- 自己的 products
- 自己的 product_images

不能写入：

- status 字段
- is_featured 字段
- admin_notes 字段
- 其他作者的数据

### 管理员

可以读写所有表。

## 10. 15 个商品限制

需要两层限制：

前端限制：

```text
作者后台显示：You can upload up to 15 products.
当产品数 >= 15，隐藏或禁用新增商品按钮。
```

后端限制：

```text
在创建商品前查询当前 artist 的商品数量。
如果数量 >= 15，拒绝创建并返回错误。
```

后续如果用 Supabase Edge Function，可以把这个限制放到服务端函数里。
