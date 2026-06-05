# Resinate With You MVP Product Requirements

## 1. 产品定位

Resinate With You 是一个带有共创感的滴胶作者发现和导流平台。

第一版不做站内交易，不处理订单、物流、退款和佣金。用户在平台上发现作品和作者，点击后跳转到作者自己的外部链接购买或联系，例如 Shopify、Etsy、Instagram、独立站、WhatsApp 等。

一句话定位：

> Discover resin artists. Create pieces together.

中文解释：

> 一个帮助用户发现独立滴胶作者，并与作者产生定制、共创和直接联系的平台。

## 2. 第一版目标

第一版目标不是做完整 marketplace，而是完成三个验证：

1. 消费者是否愿意在这里浏览滴胶成品。
2. 作者是否愿意申请入驻并上传商品。
3. 点击外部购买链接是否真的能给作者带来流量。

## 3. 用户角色

### 普通访客

可以浏览：

- 首页精选商品
- Favorite Finds 推荐模块
- Artist Directory 作者目录
- 作者详情页
- 商品详情页

可以操作：

- 按分类、地区、是否接定制筛选作者
- 搜索作者、风格、商品关键词
- 点击外部链接跳转购买或联系作者
- 提交作者入驻申请

### 作者

作者必须先提交申请，通过审核后才能登录后台。

可以操作：

- 登录作者后台
- 编辑作者资料
- 上传商品
- 修改自己的商品
- 隐藏自己的商品
- 查看自己的商品是否 live 或 hidden

限制：

- 每个作者最多上传 15 个商品
- 通过审核的作者上传商品后默认直接公开展示
- 每个商品必须填写一个外部购买或联系链接
- 作者不能直接修改平台首页推荐位

### 管理员

你或团队成员。

可以操作：

- 查看作者申请
- 通过或拒绝作者申请
- 修改作者资料
- 隐藏作者
- 隐藏明显不合适的商品
- 修改商品信息
- 隐藏商品
- 设置 Favorite Finds 推荐商品
- 查看外部链接点击次数

## 4. 第一版页面清单

### 前台页面

1. 首页
   - Hero 区
   - Favorite Finds This Week
   - Shop by Collection
   - Artist Directory 预览
   - Apply to Join 入口

2. Artist Directory
   - 搜索框
   - 分类筛选
   - 地区筛选
   - 是否接定制筛选
   - 作者卡片列表

3. 作者详情页
   - 作者头像
   - 品牌名
   - 所在地
   - 简介
   - 分类标签
   - 是否接定制
   - Instagram / Website 外链
   - 作者商品列表

4. 商品详情页
   - 商品图片
   - 商品标题
   - 作者名
   - 价格文本
   - 分类
   - 描述
   - 外部购买按钮

5. 作者申请页
   - 平台介绍
   - 申请表单
   - 授权说明
   - 提交成功提示

### 作者后台页面

1. 登录页
2. 作者后台首页
3. 编辑作者资料
4. 商品列表
5. 新增商品
6. 编辑商品

### 管理后台页面

1. 管理员登录
2. 作者申请审核
3. 作者管理
4. 商品隐藏/管理
5. 推荐商品管理
6. 点击数据概览

## 5. 首页模块

### Hero

目的：让访客马上知道这是一个滴胶作品发现平台。

主文案：

> Discover resin artists. Create pieces together.

副文案：

> Discover handmade resin accessories, gifts, and custom pieces from independent resin artists.

按钮：

- Find a Piece
- Explore Artists
- Apply to Join

### Favorite Finds This Week

目的：像你给的参考图一样，每周推荐 3-6 个精选商品。

每张卡片显示：

- 商品图
- 商品名
- 作者名
- 作者所在地
- 价格文本
- 外部链接按钮

### Artist Directory

目的：让用户把平台理解成可以查找作者的小目录。

筛选条件：

- 搜索关键词
- 商品分类
- 地区
- 是否接受定制

## 6. 作者申请流程

状态流转：

```text
submitted -> reviewing -> approved
submitted -> reviewing -> rejected
submitted -> needs_info -> reviewing -> approved
```

流程：

1. 作者填写申请表。
2. 申请进入 applications 表，状态为 submitted。
3. 管理员审核资料。
4. 通过后创建 artists 记录，状态为 approved。
5. 作者收到邮件，创建或登录账号。
6. 作者进入后台完善资料并上传商品。

## 7. 商品发布流程

状态流转：

```text
approved -> hidden
hidden -> approved
```

流程：

1. 作者创建商品。
2. 商品保存为 approved。
3. 前台直接展示。
4. 如果商品明显不合适，管理员可以隐藏。
5. 商品点击按钮跳转到 external_url。

## 8. 第一版不做

第一版明确不做：

- 站内付款
- 订单管理
- 运费计算
- 退款售后
- 作者佣金结算
- Shopify 自动导入
- Etsy 自动导入
- 用户收藏夹
- 用户评价系统
- 复杂推荐算法
- 移动 app

这些都可以以后加，但现在不做。

## 9. 关键限制

1. 每个作者最多 15 个商品。
2. 商品必须审核后展示。
3. 作者申请必须审核后通过。
4. 商品必须有外部购买或联系链接。
5. 管理员拥有最终编辑和隐藏权限。
6. 作者必须授权平台展示图片和商品信息。

## 10. MVP 成功标准

上线后 30 天内看这些指标：

- 20 个作者申请
- 10 个作者通过审核
- 100 个商品上传
- 500 个商品/作者外链点击
- 至少 3 个作者表示平台带来了真实咨询或订单
