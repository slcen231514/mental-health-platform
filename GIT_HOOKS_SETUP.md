# Git Hooks 配置说明

本项目使用 Husky 和 lint-staged 来管理 Git hooks，确保代码质量。

## 已配置的 Hooks

### 1. pre-commit Hook
在每次提交前自动运行，执行以下操作：
- 对暂存的 TypeScript/TSX 文件运行 ESLint 自动修复
- 对暂存的文件运行 Prettier 格式化

### 2. commit-msg Hook
验证提交信息格式：
- 提交信息至少需要 10 个字符
- 建议使用规范的提交信息格式

## 提交信息规范（推荐）

```
<type>(<scope>): <subject>
```

### Type 类型
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```bash
feat(auth): 添加用户登录功能
fix(api): 修复请求拦截器的 token 注入问题
docs(readme): 更新项目文档
style(button): 调整按钮样式
refactor(store): 重构状态管理逻辑
test(auth): 添加登录功能测试
chore(deps): 更新依赖包版本
```

## 配置文件

### package.json
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### .husky/commit-msg
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 提交信息格式验证
commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

if [ ${#commit_msg} -lt 10 ]; then
  echo "❌ 提交信息太短，至少需要10个字符"
  exit 1
fi

echo "✅ 提交信息格式正确"
```

## 如何使用

### 正常提交流程
```bash
# 1. 添加文件到暂存区
git add .

# 2. 提交（会自动触发 pre-commit hook）
git commit -m "feat(auth): 添加用户登录功能"

# pre-commit hook 会自动：
# - 运行 ESLint 修复代码问题
# - 运行 Prettier 格式化代码
# - 如果有问题会阻止提交

# commit-msg hook 会验证提交信息格式
```

### 跳过 Hooks（不推荐）
```bash
# 跳过所有 hooks
git commit -m "message" --no-verify

# 或使用环境变量
HUSKY=0 git commit -m "message"
```

## 故障排除

### 问题：Hooks 没有执行
**解决方案：**
```bash
# 重新安装 husky
npm run prepare

# 或手动初始化
npx husky install
```

### 问题：权限错误
**解决方案（Linux/Mac）：**
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 问题：lint-staged 失败
**解决方案：**
```bash
# 手动运行查看详细错误
npx lint-staged

# 或单独运行 lint 和 format
npm run lint:fix
npm run format
```

## 团队协作建议

1. **首次克隆项目后**：运行 `npm install` 会自动安装 hooks
2. **提交前**：确保代码通过本地测试
3. **提交信息**：使用清晰、规范的提交信息
4. **代码审查**：即使有 hooks，仍需进行代码审查

## 相关命令

```bash
# 手动运行 lint
npm run lint

# 手动修复 lint 问题
npm run lint:fix

# 手动格式化代码
npm run format

# 检查代码格式
npm run format:check

# 重新安装 husky
npm run prepare
```

## 注意事项

1. Hooks 在 Windows 系统上可能需要 Git Bash 或 WSL
2. 如果 hooks 执行失败，提交会被阻止
3. 建议在提交前先运行 `npm run lint:fix` 和 `npm run format`
4. 大型项目中，lint-staged 只会检查暂存的文件，提高效率
