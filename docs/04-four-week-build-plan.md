# Four Week DIY Build Plan

目标：4 周内做出一个可上线测试的导流型滴胶作者平台 MVP。

## Current Progress Snapshot

Date updated: 2026-06-03

| Build item | Status |
| --- | --- |
| Public homepage and static discovery pages | Done |
| Artist application page and form | Live tested |
| Server-side application submission API | Live tested |
| Application product photo upload | Live tested |
| Admin artist application review MVP | Live approve tested |
| Applicant status lookup page | Code done, needs approved-email check |
| Resend email notification wiring | Code done |
| Supabase live database verification | Mostly done |
| Public directory reads from database | Live artist display tested |
| Artist login/dashboard | Shell done |
| Product publishing | Direct publish strategy confirmed |

说明：`Code done` 表示代码已经实现并通过 lint/build，但还需要真实 Supabase/Resend 环境变量来做线上数据和邮件验证。

假设节奏：

```text
每天 2-4 小时
每周 5-6 天
第 7 天做复盘和补漏
```

如果某一天没做完，不要重开计划，把没做完的任务挪到周复盘日。

## Week 1: 静态页面和产品体验

目标：网站看起来像一个真实项目，而不是空想法。

### Day 1: 准备账号和工具

任务：

- 注册 GitHub
- 注册 Vercel
- 注册 Supabase
- 下载 VS Code
- 下载 Node.js LTS

完成标准：

- 你能打开 VS Code
- 你有 GitHub、Vercel、Supabase 账号
- 电脑能运行 `node -v`

### Day 2: 确定品牌和页面结构

任务：

- 暂定网站名
- 确定导航：Shop, Artists, Apply, About
- 确定第一版分类
- 确定作者申请字段

完成标准：

- 写出网站一句话定位
- 写出第一版页面清单

### Day 3: 搭 Next.js 项目

任务：

- 创建 Next.js 项目
- 安装 Tailwind CSS
- 建立基础文件结构
- 推送到 GitHub

完成标准：

- 本地能打开首页
- GitHub 上有项目仓库

### Day 4: 做首页 Hero 和导航

任务：

- 做顶部导航
- 做 Hero 区
- 加主文案和副文案
- 加按钮：Find a Piece, Explore Artists, Apply to Join

完成标准：

- 首页第一屏看起来完整
- 手机尺寸不乱

### Day 5: 做 Favorite Finds 推荐模块

任务：

- 做 3-6 个精选商品卡片
- 商品卡片包含图、标题、作者、地区、价格
- 商品按钮显示 Visit Shop

完成标准：

- 推荐模块像你截图里那种清晰商品推荐

### Day 6: 做 Artist Directory 静态版

任务：

- 做搜索框
- 做分类筛选
- 做地区筛选
- 做是否接定制筛选
- 做 6 个假作者卡片

完成标准：

- 可以用假数据筛选作者

### Day 7: Week 1 复盘

任务：

- 检查首页
- 检查移动端
- 修文字太挤的地方
- 记录想改的设计灵感

完成标准：

- 第一版静态 demo 可以给朋友看

## Week 2: 数据库和申请流程

目标：让网站从假数据变成可以保存真实申请。

### Day 8: 建 Supabase 项目

任务：

- 创建 Supabase project
- 保存 project URL
- 保存 anon key
- 保存 database password

完成标准：

- Supabase 项目创建成功

### Day 9: 建数据库表

任务：

- 建 profiles
- 建 applications
- 建 artists
- 建 products
- 建 product_images
- 建 clicks
- 建 featured_products

完成标准：

- 所有表在 Supabase 里能看到

### Day 10: 前台读取数据库

任务：

- 配置 Supabase client
- 从 products 读取 approved 商品
- 从 artists 读取 approved 作者

完成标准：

- 页面数据来自数据库，不再只是写死在代码里

### Day 11: 做作者申请页

任务：

- 做 Apply to Join 页面
- 做申请表字段
- 加授权 checkbox
- 加提交成功提示
- 要求上传 3 张不同作品照片
- Short bio 限制为 500 characters
- 状态：code done

完成标准：

- 表单可以填写完整资料

### Day 12: 申请写入数据库

任务：

- 表单提交到 applications 表
- 默认 status 为 submitted
- 必填字段校验
- 授权 checkbox 必须勾选
- 状态：code done, needs live Supabase verification

完成标准：

- Supabase 里能看到新申请

### Day 13: Directory 读取真实作者

任务：

- Artist Directory 从 artists 表读取
- 只显示 approved 作者
- 搜索和筛选继续可用

完成标准：

- 后台新增作者后，前台能显示

### Day 14: Week 2 复盘

任务：

- 测试申请表
- 检查数据库字段是否够用
- 补充审核状态

完成标准：

- 用户可以提交申请，你能在数据库看到

## Week 3: 作者账号和商品上传

目标：作者能登录，上传商品，但商品必须审核后上线。

### Day 15: 接 Supabase Auth

任务：

- 开启邮箱登录
- 做登录页
- 做登出按钮
- 建立登录保护逻辑

完成标准：

- 用户可以登录和登出

### Day 16: 作者后台入口

任务：

- 做 `/dashboard`
- 登录后进入作者后台
- 未登录用户跳转登录

完成标准：

- 作者可以进入自己的后台

### Day 17: 编辑作者资料

任务：

- 做编辑品牌名、简介、地区、链接
- 上传头像
- 保存到 artists 表

完成标准：

- 作者资料能更新

### Day 18: 商品创建表单

任务：

- 做新增商品页面
- 字段：标题、分类、描述、价格、外部链接
- 商品默认 pending

完成标准：

- 作者能创建商品

### Day 19: 商品图片上传

任务：

- 配置 Supabase Storage
- 上传商品图片
- 图片链接写入 product_images

完成标准：

- 商品详情能显示上传图片

### Day 20: 15 个商品限制

任务：

- 查询作者当前商品数量
- >= 15 时禁用新增商品
- 创建商品时再次检查数量

完成标准：

- 每个作者最多 15 个商品

### Day 21: Week 3 复盘

任务：

- 测试作者从登录到上传商品的完整流程
- 修错误提示
- 检查手机端后台是否能用

完成标准：

- 作者可以提交商品等待审核

## Week 4: 管理后台、审核、上线

目标：你可以控制质量，然后上线邀请第一批作者。

### Day 22: 管理员后台入口

任务：

- 做 `/admin`
- 只允许 admin 角色进入
- 显示待审核数量
- 状态：MVP code done at `/admin/applications` with optional `ADMIN_REVIEW_TOKEN`

完成标准：

- 管理员能进入后台，普通作者不能进

### Day 23: 作者审核

任务：

- 列出 applications
- 通过申请
- 拒绝申请
- 填写 admin_notes
- 发送审核结果邮件
- 作者可以查询申请状态
- 状态：code done, needs live Supabase and Resend verification

完成标准：

- 你能审核作者申请

### Day 24: 商品发布管理

任务：

- 让通过审核的作者直接发布商品
- 确认商品能出现在前台 products 页面
- 隐藏商品

完成标准：

- 通过审核的作者发布商品后可以直接出现在前台，管理员保留隐藏明显不合适商品的能力

### Day 25: Favorite Finds 管理

任务：

- 选择商品设为 featured
- 设置排序
- 首页读取 featured_products

完成标准：

- 你能控制首页推荐商品

### Day 26: 点击统计

任务：

- 用户点击外部链接时写入 clicks
- admin 后台显示点击数

完成标准：

- 能看到每个商品或作者的点击量

### Day 27: 上线前检查

任务：

- 检查移动端
- 检查所有按钮
- 检查空状态
- 检查文案
- 检查外部链接

完成标准：

- 没有明显 broken 页面

### Day 28: 部署和邀请

任务：

- 部署到 Vercel
- 绑定域名
- 发送给 5 个朋友测试
- 准备邀请作者私信

完成标准：

- 你有一个可以发给真实作者的链接
