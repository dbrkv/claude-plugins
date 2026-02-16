# Readme

v3 contain bug

```sh
uv tool install skill-seekers==2.9.0
```

```sh
skill-seekers scrape --config configs/symfony.json
skill-seekers enhance output/symfony/
skill-seekers analyze --directory . --enhance
```

Analuze command si to analyze source code

- [Enhancement Modes Guide](https://github.com/yusufkaraaslan/Skill_Seekers/blob/development/docs/features/ENHANCEMENT_MODES.md)

```sh
# 📦 Package your skill:
skill-seekers-package output/symfony/

# 💡 Optional: Enhance SKILL.md with Claude:
# Local (recommended):
skill-seekers-enhance output/symfony/
```
