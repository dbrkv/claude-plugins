---
name: atmos
description: Atmos is a cloud architecture framework for native Terraform
---

# Atmos Skill

Comprehensive assistance with Atmos development, generated from official documentation.

## When to Use This Skill

This skill should be triggered when:

**Direct Atmos Usage:**
- Working with Atmos CLI commands (`atmos terraform plan/apply`, `atmos list components`, etc.)
- Configuring Atmos projects (`atmos.yaml` setup, stack configurations)
- Implementing Atmos components and stacks
- Debugging Atmos infrastructure deployments
- Setting up Atmos workflows and automation

**Infrastructure as Code with Atmos:**
- Designing cloud architectures using Terraform components
- Managing multi-environment, multi-region deployments
- Implementing GitOps workflows with Atmos
- Creating reusable infrastructure patterns
- Managing infrastructure dependencies between components

**DevOps and Cloud Automation:**
- Setting up CI/CD pipelines for Terraform deployments
- Implementing infrastructure validation and testing
- Managing cloud provider authentication (AWS, Azure, GCP)
- Configuring Atlantis with Atmos
- Implementing infrastructure security best practices

**Advanced Use Cases:**
- Migrating existing Terraform to Atmos
- Setting up component libraries and vendoring
- Implementing custom Atmos commands and workflows
- Scaling infrastructure across teams and organizations
- Integrating Atmos with other DevOps tools

## Quick Reference

### Core Component Examples

**Basic Component Structure:**
```hcl
# components/terraform/vpc/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    {
      Name = var.name
    },
    var.tags
  )
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "name" {
  description = "Name of the VPC"
  type        = string
}

variable "tags" {
  description = "Tags to apply to the VPC"
  type        = map(string)
  default     = {}
}
```

**Stack Configuration Example:**
```yaml
# stacks/ue2/dev.yaml
components:
  terraform:
    vpc:
      backend:
        s3:
          role_arn: "arn:aws:iam::123456789012:role/terraform-backend"
          encrypt: true
          bucket: "my-terraform-state-bucket"
          key: "terraform-state/ue2/dev/vpc/terraform.tfstate"
          region: "us-east-2"
      vars:
        name: "ue2-dev-vpc"
        vpc_cidr: "10.10.0.0/16"
        tags:
          Environment: "dev"
          Region: "us-east-2"
```

### Common CLI Commands

**List Components:**
```bash
# List all components
atmos list components

# List components in specific stack
atmos list components -s ue2-dev
```

**Terraform Operations:**
```bash
# Plan infrastructure
atmos terraform plan vpc -s ue2-dev

# Apply infrastructure
atmos terraform apply vpc -s ue2-dev

# Generate Terraform varfile
atmos terraform generate varfile vpc -s ue2-dev

# Start Terraform shell
atmos terraform shell vpc -s ue2-dev
```

**Describe Configurations:**
```bash
# Describe component configuration
atmos describe component vpc -s ue2-dev

# List all stacks
atmos list stacks

# Show final CLI configuration
atmos describe config
```

### Atmos.yaml Configuration

**Basic Atmos Configuration:**
```yaml
# atmos.yaml
components:
  terraform:
    # Path to Terraform components
    path: "components/terraform"
    # Apply auto-tagging to all components
    auto_tag: true
    # Default command for Terraform operations
    command: "terraform"

stacks:
  # Path to stack configurations
  path: "stacks"
  # Base path for included files
  included_paths:
    - "catalogs/**/*"
  # Exclude patterns
  excluded_paths:
    - "**/_defaults.yaml"
```

**Custom Commands Configuration:**
```yaml
# atmos.yaml
commands:
  - name: "deploy-all"
    description: "Deploy all components in a stack"
    steps:
      - atmos terraform plan infra/vpc -s {{.stack}}
      - atmos terraform apply infra/vpc -s {{.stack}}
      - atmos terraform plan eks/cluster -s {{.stack}}
      - atmos terraform apply eks/cluster -s {{.stack}}
```

### Stack Inheritance

**Base Configuration:**
```yaml
# stacks/defaults.yaml
components:
  terraform:
    vpc:
      vars:
        tags:
          Organization: "my-company"
          ManagedBy: "atmos"
```

**Environment-Specific Override:**
```yaml
# stacks/ue2/dev.yaml
import:
  - catalogs/defaults
  - catalogs/regions/us-east-2

components:
  terraform:
    vpc:
      vars:
        environment: "dev"
        vpc_cidr: "10.10.0.0/16"
```

### Workflow Examples

**Multi-Step Deployment:**
```yaml
# workflows/deploy-infrastructure.yaml
name: "deploy-infrastructure"
description: "Deploy complete infrastructure stack"

steps:
  - name: "validate"
    command: "atmos validate component {{.component}} -s {{.stack}}"

  - name: "plan"
    command: "atmos terraform plan {{.component}} -s {{.stack}}"

  - name: "apply"
    command: "atmos terraform apply {{.component}} -s {{.stack}}"
    continue_on_error: false
```

### Best Practices Examples

**Component Anti-Pattern to Avoid:**
```hcl
# ❌ AVOID: Single resource components
# This is too small and should be part of a larger component
resource "aws_iam_policy" "this" {
  name        = var.policy_name
  description = var.description
  policy      = var.policy_document
}
```

**Better Component Design:**
```hcl
# ✅ GOOD: Multi-purpose security component
resource "aws_iam_role" "this" {
  name = var.role_name
  assume_role_policy = var.assume_role_policy
}

resource "aws_iam_policy" "this" {
  name   = var.policy_name
  policy = var.policy_document
}

resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.this.arn
}
```

## Key Concepts

**Components:**
- Reusable Terraform modules that perform specific infrastructure functions
- Should be single-purpose and follow the UNIX philosophy
- Examples: VPC, EKS cluster, RDS database, IAM roles

**Stacks:**
- YAML configuration files that define infrastructure environments
- Describe which components to deploy and how to configure them
- Support inheritance, imports, and overrides for DRY configurations

**Stack Configuration as Factory Pattern:**
- Use stack configurations to instantiate multiple component instances
- Avoid creating factories inside Terraform components
- Keeps state files small and isolated

**Component Lifecycle Management:**
- Group resources by lifecycle (e.g., VPCs separate from databases)
- Separate rarely changed infrastructure from frequently updated resources
- Use remote state for cross-component dependencies

**Regions and Disaster Recovery:**
- Keep Terraform state separate by region
- Each region should have independent state management
- Enables regional outage isolation

## Reference Files

This skill includes comprehensive documentation in `references/`:

### llms-txt.md
**Complete LLMs-Txt documentation** following llmstxt.org standard. Contains:
- **Best Practices**: Comprehensive guidelines for component and stack design
- **Component Best Practices**: Detailed guidance on creating reusable Terraform components
- **Stack Best Practices**: Configuration management and inheritance patterns
- **Anti-Patterns**: Common mistakes to avoid when working with Atmos

### llms.md
**Navigation index** with direct links to all documentation sections:
- CLI command reference (100+ commands)
- Configuration options and examples
- Authentication guides for AWS, Azure, GCP
- Workflow and automation patterns

### llms-full.md
**Complete documentation** with all content in a single file:
- Full text content from all documentation sections
- Code examples with syntax highlighting
- Links to original documentation
- Cross-references and related topics

Use `view` to read specific reference files when detailed information is needed.

## Working with This Skill

### For Beginners

**Getting Started:**
1. **Read the Key Concepts** section above to understand core Atmos terminology
2. **Start with simple component creation** - begin with a basic VPC or security group
3. **Use the Quick Reference examples** to understand common patterns
4. **Configure atmos.yaml** with basic settings for your project structure

**Learning Path:**
1. **Component Design**: Study the component examples in the Quick Reference
2. **Stack Configuration**: Learn stack inheritance and variable management
3. **CLI Commands**: Practice with `atmos list` and `atmos describe` commands
4. **Basic Deployments**: Try `atmos terraform plan/apply` with simple components

### For Intermediate Users

**Advanced Configuration:**
- **Stack Inheritance**: Use the catalog pattern for shared configurations
- **Custom Commands**: Create workflows for complex deployments
- **Component Libraries**: Organize reusable components in centralized libraries
- **Vendoring**: Pull remote components for immutable infrastructure

**Production Patterns:**
- **Multi-region deployments**: Configure separate stacks per region
- **Team-based workflows**: Use Atlantis integration for collaborative deployments
- **Security best practices**: Follow the IAM and security component patterns
- **Cost optimization**: Implement tagging and resource lifecycle management

### For Advanced Users

**Enterprise Scale:**
- **GitOps workflows**: Integrate Atmos with GitHub Actions, GitLab CI
- **Policy validation**: Implement OPA policies for configuration validation
- **Custom providers**: Extend Atmos with custom tooling and integrations
- **Multi-cloud management**: Configure components for AWS, Azure, GCP simultaneously

**Advanced Features:**
- **Component vendoring**: Manage external component dependencies
- **Custom workflows**: Create complex multi-step deployment pipelines
- **Authentication**: Set up SSO, OIDC, and federated access patterns
- **Monitoring**: Configure logging and observability for Atmos operations

**Navigation Tips:**
- Use `atmos list components` to discover available components
- Use `atmos describe component <name> -s <stack>` to see complete configuration
- Use `atmos validate stacks` to check configuration before deployment
- Reference the `references/llms.md` file for specific command documentation

## Resources

### references/
Organized documentation extracted from official sources. These files contain:
- **Detailed explanations** of Atmos concepts and patterns
- **Code examples** with language annotations for syntax highlighting
- **Links to original documentation** for further reading
- **Table of contents** for quick navigation to specific topics

### scripts/
Add helper scripts here for common automation tasks:
- **Setup scripts**: Initialize new Atmos projects
- **Validation scripts**: Run compliance checks on configurations
- **Deployment scripts**: Automate complex deployment patterns

### assets/
Add templates, boilerplate, or example projects here:
- **Component templates**: Reusable starting points for common infrastructure
- **Stack templates**: Environment configuration patterns
- **CI/CD examples**: GitHub Actions, GitLab CI, Jenkins pipeline definitions

## Notes

- **Generated from official documentation**: This skill contains the latest information from Atmos docs
- **Best practices included**: All examples follow recommended patterns from the official documentation
- **Practical focus**: Emphasis on real-world usage patterns and common scenarios
- **Community-driven**: Includes insights from production Atmos deployments

## Updating

To refresh this skill with updated documentation:
1. Re-run the scraper with the same configuration
2. The skill will be rebuilt with the latest information
3. All custom additions will be preserved in their respective sections

## Troubleshooting

**Common Issues:**
- **Stack not found**: Check that your stack YAML file exists and follows the correct path pattern
- **Component validation errors**: Ensure component structure follows the recommended patterns
- **Authentication failures**: Verify cloud provider credentials are properly configured
- **State lock errors**: Use `atmos terraform force-unlock` if necessary for emergency situations

**Getting Help:**
- Use `atmos help` for command assistance
- Check the official Atmos documentation at https://atmos.tools
- Refer to the reference files in this skill for detailed explanations
- Join the Atmos community for support and best practices
