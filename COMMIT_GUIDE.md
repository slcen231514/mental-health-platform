# Git 提交指南

## 首次设置

当你首次克隆项目或拉取这些更改后，运行：

```bash
cd web-frontend
npm install
```

这会自动安装所有依赖，包括 Husky Git hooks。

## 提交到 GitHub 的文件清单

### ✅ 应该提交的配置文件

**代码质量工具配置：**
- `.eslintrc.cjs` - ESLint 配置
- `.prettierrc.json` - Prettier 配置
- `.prettierignore` - Prettier 忽略规则
- `.editorconfig` - 编辑器统一配置

**Git Hooks：**
- `.husky/pre-commit` - 提交前检查
- `.husky/commit-msg` - 提交信息验证
- `.husky/.gitignore` - Husky 忽略规则

**编辑器配置：**
- `.vscode/settings.json` - VSCode 团队共享配置

**环境变量模板：**
- `.env.example` - 环境变量示例（不含敏感信息）
- `.env.development` - 开发环境配置（如果不含敏感信息）

**文档：**
- `GIT_HOOKS_SETUP.md` - Git hooks 使用说明
- `COMMIT_GUIDE.md` - 本文件

### ❌ 不应该提交的文件

这些文件已在 `.gitignore` 中配置：

- `.env.local` - 本地环境变量（包含敏感信息）
- `.env.*.local` - 其他本地环境变量
- `node_modules/` - 依赖包
- `dist/` - 构建产物
- `.husky/_/` - Husky 内部文件

## 提交流程

### 1. 添加文件
```bash
git add .
```

### 2. 提交（会自动触发 hooks）
```bash
git commit -m "feat(auth): 添加用户登录功能"
```

**自动执行的操作：**
- ✅ pre-commit hook 运行 lint-staged
- ✅ 自动修复 ESLint 问题
- ✅ 自动格式化代码
- ✅ commit-msg hook 验证提交信息

### 3. 推送到 GitHub
```bash
git push origin main
```

## 提交信息规范

使用语义化提交信息：

```
<type>(<scope>): <subject>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具变动

**示例：**
```bash
git commit -m "feat(auth): 添加用户登录功能"
git commit -m "fix(api): 修复 token 刷新问题"
git commit -m "docs(readme): 更新安装说明"
git commit -m "style(button): 调整按钮样式"
git commit -m "refactor(store): 重构状态管理"
git commit -m "test(auth): 添加登录测试"
git commit -m "chore(deps): 更新依赖版本"
```

## 团队协作

### 新成员加入项目

1. **克隆仓库：**
```bash
git clone <repository-url>
cd mental-health-platform/web-frontend
```

2. **安装依赖：**
```bash
npm install
```

这会自动：
- 安装所有 npm 包
- 设置 Git hooks（通过 `prepare` 脚本）

3. **配置本地环境变量：**
```bash
cp .env.example .env.local
# 编辑 .env.local，填入你的本地配置
```

4. **开始开发：**
```bash
npm run dev
```

### 拉取最新代码

```bash
git pull origin main
npm install  # 如果 package.json 有更新
```

## 常见问题

### Q: Hooks 没有执行？
**A:** 运行 `npm install` 或 `npm run prepare` 重新安装 hooks。

### Q: 提交被阻止了？
**A:** 检查错误信息：
- ESLint 错误：运行 `npm run lint:fix`
- Prettier 格式问题：运行 `npm run format`
- 提交信息太短：确保至少 10 个字符

### Q: 需要跳过 hooks？
**A:** 不推荐，但紧急情况下可以：
```bash
git commit -m "message" --no-verify
```

### Q: Windows 系统 hooks 不工作？
**A:** 确保使用 Git Bash 或 WSL，或者安装 Git for Windows。

## 检查清单

提交前确认：

- [ ] 代码通过 `npm run lint` 检查
- [ ] 代码通过 `npm run format:check` 检查
- [ ] 本地测试通过
- [ ] 提交信息清晰、规范
- [ ] 没有提交敏感信息（密钥、密码等）
- [ ] 没有提交 `node_modules/` 或 `dist/`

## 相关命令

```bash
# 检查代码质量
npm run lint              # 检查 ESLint
npm run lint:fix          # 自动修复 ESLint 问题
npm run format            # 格式化代码
npm run format:check      # 检查代码格式

# Git 操作
git status                # 查看状态
git add .                 # 添加所有文件
git commit -m "message"   # 提交
git push                  # 推送

# Husky
npm run prepare           # 重新安装 hooks
```

## 更多信息

详细的 Git hooks 配置说明，请查看 `GIT_HOOKS_SETUP.md`。
