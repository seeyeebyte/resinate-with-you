# Account Setup Checklist

这份清单是开工当天照着做的版本。

建议先准备一个专门邮箱：

```text
hello@yourdomain.com
```

如果还没有域名，先用 Gmail：

```text
resinate.project@gmail.com
```

Resinate With You 现在是 MVP 工作品牌。正式公开推广前，先检查域名、社交账号和商标风险；开发工具账号可以继续用中性项目名。

## 1. GitHub

用途：

```text
保存代码
连接 Vercel 自动部署
记录项目版本
```

官网：

```text
https://github.com
```

需要准备：

```text
邮箱
用户名
强密码
手机 2FA 或 Authenticator
```

建议用户名：

```text
resinate
resinate-app
resinate-studio
yourname-resinate
```

如果官方名字拿不到，不影响开发。GitHub 用户名不一定等于品牌名。

创建仓库时：

```text
Repository name: resinate
Visibility: Private
Add README: Yes
```

## 2. Vercel

用途：

```text
把网站部署上线
连接 GitHub 后自动更新
```

官网：

```text
https://vercel.com
```

注册方式：

```text
Continue with GitHub
```

需要准备：

```text
GitHub 账号
项目仓库
```

第一阶段选择：

```text
Hobby plan
```

暂时不用升级。

## 3. Supabase

用途：

```text
作者登录
数据库
图片上传
审核状态
后台权限
```

官网：

```text
https://supabase.com
```

注册方式：

```text
Continue with GitHub
```

创建项目时填写：

```text
Organization name: Resinate With You
Project name: resinate
Database password: 用密码管理器生成强密码
Region: 选离主要用户近的地区
```

如果主要用户在美国：

```text
Region: US East 或 US West
```

如果主要用户全球都有，先选美国也可以。

创建后要保存：

```text
Project URL
Anon public key
Service role key
Database password
```

注意：

```text
Service role key 不能放到前端代码里。
```

## 4. Resend

用途：

```text
发送作者申请通知
发送审核通过邮件
发送需补充资料邮件
```

官网：

```text
https://resend.com
```

第一阶段可以先不用接，等后台基本完成再接。

需要准备：

```text
邮箱
域名
DNS 管理权限
```

如果还没有域名，可以先跳过。

## 5. 域名

用途：

```text
正式上线地址
品牌邮箱
邮件发送验证
```

可以用：

```text
Cloudflare Registrar
Porkbun
Namecheap
```

先查但不要急着买：

```text
resinate.com
resinate.co
resinate.app
resinate.shop
resinatefinds.com
theresinedit.com
resinfinds.com
castandfound.com
```

如果 `.com` 太贵，可以考虑：

```text
.co
.app
.studio
.shop
```

但长期品牌最好还是 `.com`。

## 6. Instagram / TikTok / Pinterest

用途：

```text
邀请作者
发精选商品
做 SEO 和流量入口
```

优先注册：

```text
@resinate
@shopresinate
@resinatefinds
@theresinedit
@resinfinds
```

简介模板：

```text
Discover resin artists. Create pieces together.
Apply to join:
```

## 7. Notion 或 Google Drive

用途：

```text
整理作者名单
保存竞品截图
保存文案
记录账号信息
```

建议建这些文件夹：

```text
Brand
Competitors
Artist Leads
Product Ideas
Screenshots
Legal & Domains
```

## 8. 开工当天顺序

按这个顺序做：

```text
1. 确认临时品牌名
2. 注册 GitHub
3. 注册 Vercel
4. 注册 Supabase
5. 下载 VS Code
6. 下载 Node.js LTS
7. 创建 GitHub 仓库
8. 创建 Next.js 项目
9. 推送到 GitHub
10. 连接 Vercel 部署
```

## 9. 暂时不要做

先不要急着做：

```text
买昂贵域名
注册公司
申请商标
付费升级所有工具
接 Shopify API
做移动 app
做站内付款
```

等 MVP 做出来、有人愿意申请入驻后，再花钱。
