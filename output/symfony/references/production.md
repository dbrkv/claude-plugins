# Symfony - Production

**Pages:** 3

---

## How to Deploy a Symfony Application

**URL:** https://symfony.com/doc/7.4/deployment.html

**Contents:**
- How to Deploy a Symfony Application
- Symfony Deployment Basics
- How to Deploy a Symfony Application
  - Basic File Transfer
  - Using Source Control
  - Using Platforms as a Service
  - Using Build Scripts and other Tools
- Common Deployment Tasks
  - A) Check Requirements
  - B) Configure your Environment Variables

Deploying a Symfony application can be a complex and varied task depending on the setup and the requirements of your application. This article is not a step-by-step guide, but rather a general list of the most common requirements and ideas for deployment.

The typical steps taken while deploying a Symfony application include:

A deployment may also include other tasks, such as:

There are several ways you can deploy a Symfony application. Start with a few basic deployment strategies and build up from there.

The most basic way of deploying an application is copying the files manually via FTP/SCP (or similar method). This has its disadvantages as you lack control over the system as the upgrade progresses. This method also requires you to take some manual steps after transferring the files (see Common Deployment Tasks).

If you're using source control (e.g. Git or SVN), you can simplify by having your live installation also be a copy of your repository. When you're ready to upgrade, fetch the latest updates from your source control system. When using Git, a common approach is to create a tag for each release and check out the appropriate tag on deployment (see Git Tagging).

This makes updating your files easier, but you still need to worry about manually taking other steps (see Common Deployment Tasks).

Using a Platform as a Service (PaaS) can be a great way to deploy your Symfony app quickly. There are many PaaS, but we recommend Upsun as it provides a dedicated Symfony integration and helps fund the Symfony development.

There are also tools to help ease the pain of deployment. Some of them have been specifically tailored to the requirements of Symfony.

Before and after deploying your actual source code, there are a number of common things you'll need to do:

There are some technical requirements for running Symfony applications. In your development machine, the recommended way to check these requirements is to use Symfony CLI. However, in your production server you might prefer to not install the Symfony CLI tool. In those cases, install this other package in your application:

Then, make sure that the checker is included in your Composer scripts:

Most Symfony applications read their configuration from environment variables. While developing locally, you'll usually store these in .env files. On production, you have two options:

There is no significant advantage to either option: use whichever is most natural for your hosting environment.

You might not want your application to process the .env.* files on every request. You can generate an optimized .env.local.php which overrides all other configuration files:

The generated file will contain all the configuration stored in .env. If you want to rely only on environment variables, generate one without any values using:

If you don't have Composer installed on the production server, use instead the dotenv:dump Symfony command.

Your vendors can be updated before transferring your source code (i.e. update the vendor/ directory, then transfer that with your source code) or afterwards on the server. Either way, update your vendors as you normally do:

The --optimize-autoloader flag improves Composer's autoloader performance significantly by building a "class map". The --no-dev flag ensures that development packages are not installed in the production environment.

If you get a "class not found" error during this step, you may need to run export APP_ENV=prod (or export SYMFONY_ENV=prod if you're not using Symfony Flex) before running this command so that the post-install-cmd scripts run in the prod environment.

Make sure you clear and warm-up your Symfony cache:

There may be lots of other things that you need to do, depending on your setup:

While this article covers the technical details of deploying, the full lifecycle of taking code from development up to production may have more steps: deploying to staging, QA (Quality Assurance), running tests, etc.

The use of staging, testing, QA, continuous integration, database migrations and the capability to roll back in case of failure are all strongly advised. There are simple and more complex tools and one can make the deployment as easy (or sophisticated) as your environment requires.

Don't forget that deploying your application also involves updating any dependency (typically via Composer), migrating your database, clearing your cache and other potential things like pushing assets to a CDN (see Common Deployment Tasks).

The project root directory (whose value is used via the kernel.project_dir parameter and the getProjectDir() method) is calculated automatically by Symfony as the directory where the main composer.json file is stored.

In deployments not using the composer.json file, you'll need to override the getProjectDir() method as explained in this section.

Measure & Improve Symfony Code Performance

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/requirements-checker
```

Example 2 (json):
```json
{
    "...": "...",

    "scripts": {
        "auto-scripts": {
            "vendor/bin/requirements-checker": "php-script",
            "...": "..."
        },

        "...": "..."
    }
}
```

Example 3 (unknown):
```unknown
$ composer dump-env prod
```

Example 4 (unknown):
```unknown
$ composer dump-env prod --empty
```

---

## Performance

**URL:** https://symfony.com/doc/7.4/performance.html

**Contents:**
- Performance
- Performance Checklists
  - Restrict the Number of Locales Enabled in the Application
  - Dump the Service Container into a Single File
  - Use the OPcache Bytecode Cache
  - Use the OPcache class preloading
  - Configure OPcache for Maximum Performance
  - Don't Check PHP Files Timestamps
  - Configure the PHP realpath Cache
  - Optimize Composer Autoloader

Symfony is fast. However, you can make it faster if you optimize your servers and your applications as explained in the following performance checklists.

Use these checklists to verify that your application and server are configured for maximum performance:

Symfony Application Checklist:

Production Server Checklist:

Use the framework.enabled_locales option to only generate the translation files actually used in your application.

Symfony compiles the service container into multiple small files by default. Set this parameter to true to compile the entire container into a single file, which could improve performance when using PHP class preloading:

The . prefix denotes a parameter that is only used during compilation of the container. See Configuration Parameters for more details.

OPcache caches the compiled bytecode of PHP scripts to avoid recompiling them on each request. PHP ships with OPcache, but depending on your setup, you may need to enable it explicitly.

OPcache can compile and load classes at start-up and make them available to all requests until the server is restarted, improving performance significantly.

During container compilation (e.g. when running the cache:clear command), Symfony generates a file with the list of classes to preload in the var/cache/ directory. Rather than use this file directly, use the config/preload.php file that is created when using Symfony Flex in your project:

If this file is missing, run this command to update the Symfony Flex recipe: composer recipes:update symfony/framework-bundle.

Use the container.preload and container.no_preload service tags to define which classes should or should not be preloaded by PHP.

The default OPcache configuration is not suited for Symfony applications, so it's recommended to change these settings as follows:

In production servers, PHP files should never change, unless a new application version is deployed. However, by default OPcache checks if cached files have changed their contents since they were cached. This check introduces some overhead that can be avoided as follows:

After each deployment, you must empty and regenerate the cache of OPcache. Otherwise you won't see the updates made in the application. Given that in PHP, the CLI and the web processes don't share the same OPcache, you cannot clear the web server OPcache by executing some command in your terminal. These are some of the possible solutions:

When a relative path is transformed into its real and absolute path, PHP caches the result to improve performance. Applications that open many PHP files, such as Symfony projects, should use at least these values:

PHP disables the realpath cache when the open_basedir config option is enabled.

The class loader used while developing the application is optimized to find new and changed classes. In production servers, PHP files should never change, unless a new application version is deployed. That's why you can optimize Composer's autoloader to scan the entire application once and build an optimized "class map", which is a big array of the locations of all the classes and it's stored in vendor/composer/autoload_classmap.php.

Execute this command to generate the new class map (and make it part of your deployment process too):

In debug mode, Symfony generates an XML file with all the service container information (services, arguments, etc.) This XML file is used by various debugging commands such as debug:container and debug:autowiring.

When the container grows larger and larger, so does the size of the file and the time to generate it. If the benefit of this XML file does not outweigh the decrease in performance, you can stop generating the file as follows:

Blackfire is the best tool to profile and optimize performance of Symfony applications during development, test and production. It's a commercial service, but provides a full-featured demo.

Symfony provides a basic performance profiler in the development config environment. Click on the "time panel" of the web debug toolbar to see how much time Symfony spent on tasks such as making database queries and rendering templates.

You can measure the execution time and memory consumption of your own code and display the result in the Symfony profiler thanks to the Stopwatch component.

When using autowiring, type-hint any controller or service argument with the Stopwatch class and Symfony will inject the debug.stopwatch service:

If the request calls this service during its execution, you'll see a new event called export-data in the Symfony profiler.

The start(), stop() and getEvent() methods return a StopwatchEvent object that provides information about the current event, even while it's still running. This object can be converted to a string for a quick summary:

You can also profile your template code with the stopwatch Twig tag:

Use the second optional argument of the start() method to define the category or tag of the event. This helps keep events organized by type:

A real-world stopwatch not only includes the start/stop button but also a "lap button" to measure each partial lap. This is exactly what the lap() method does, which stops an event and then restarts it immediately:

The getLastPeriod() method was introduced in Symfony 7.2.

Sections are a way to split the profile timeline into groups. Example:

All events that don't belong to any named section are added to the special section called __root__. This way you can get all stopwatch events, even if you don't know their names, as follows:

The Stopwatch::ROOT constant as a shortcut for __root__ was introduced in Symfony 7.2.

Symfony Code Performance Profiling

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (yaml):
```yaml
# config/services.yaml
parameters:
    # ...
    .container.dumper.inline_factories: true
```

Example 2 (xml):
```xml
<!-- config/services.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/services https://symfony.com/schema/dic/services/services-1.0.xsd">

    <parameters>
        <!-- ... -->
        <parameter key=".container.dumper.inline_factories">true</parameter>
    </parameters>
</container>
```

Example 3 (php):
```php
// config/services.php
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return function(ContainerConfigurator $container): void {
    $container->parameters()->set('.container.dumper.inline_factories', true);
};
```

Example 4 (unknown):
```unknown
; php.ini
opcache.preload=/path/to/project/config/preload.php

; required for opcache.preload:
opcache.preload_user=www-data
```

---

## How to Configure Symfony to Work behind a Load Balancer or a Reverse Proxy

**URL:** https://symfony.com/doc/7.4/deployment/proxies.html

**Contents:**
- How to Configure Symfony to Work behind a Load Balancer or a Reverse Proxy
- Solution: setTrustedProxies()
- But what if the IP of my Reverse Proxy Changes Constantly!
- Reverse proxy in a subpath / subfolder
- Custom Headers When Using a Reverse Proxy
- Overriding Configuration Behind Hidden SSL Termination

When you deploy your application, you may be behind a load balancer (e.g. an AWS Elastic Load Balancing) or a reverse proxy (e.g. Varnish for caching).

For the most part, this doesn't cause any problems with Symfony. But, when a request passes through a proxy, certain request information is sent using either the standard Forwarded header or X-Forwarded-* headers. For example, instead of reading the REMOTE_ADDR header (which will now be the IP address of your reverse proxy), the user's true IP will be stored in a standard Forwarded: for="..." header or a X-Forwarded-For header.

If you don't configure Symfony to look for these headers, you'll get incorrect information about the client's IP address, whether or not the client is connecting via HTTPS, the client's port and the hostname being requested.

To fix this, you need to tell Symfony which reverse proxy IP addresses to trust and what headers your reverse proxy uses to send information.

You can do that by setting the SYMFONY_TRUSTED_PROXIES and SYMFONY_TRUSTED_HEADERS environment variables on your machine. Alternatively, you can configure them using the following configuration options:

private_ranges as a shortcut for private IP address ranges for the trusted_proxies option was introduced in Symfony 7.1.

Support for the SYMFONY_TRUSTED_PROXIES and SYMFONY_TRUSTED_HEADERS environment variables was introduced in Symfony 7.2.

Enabling the Request::HEADER_X_FORWARDED_HOST option exposes the application to HTTP Host header attacks. Make sure the proxy really sends an x-forwarded-host header.

The Request object has several Request::HEADER_* constants that control exactly which headers from your reverse proxy are trusted. The argument is a bit field, so you can also pass your own value (e.g. 0b00110).

You can set a TRUSTED_PROXIES env var to configure proxies on a per-environment basis:

The "trusted proxies" feature does not work as expected when using the nginx realip module. Disable that module when serving Symfony applications.

Some reverse proxies (like AWS Elastic Load Balancing) don't have a static IP address or even a range that you can target with the CIDR notation. In this case, you'll need to - very carefully - trust all proxies.

Once you've guaranteed that traffic will only come from your trusted reverse proxies, configure Symfony to always trust incoming request:

The support for the 'PRIVATE_SUBNETS' string was introduced in Symfony 7.2.

That's it! It's critical that you prevent traffic from all non-trusted sources. If you allow outside traffic, they could "spoof" their true IP address and other information.

If you are also using a reverse proxy on top of your load balancer (e.g. CloudFront), calling $request->server->get('REMOTE_ADDR') won't be enough, as it will only trust the node sitting directly above your application (in this case your load balancer). You also need to append the IP addresses or ranges of any additional proxy (e.g. CloudFront IP ranges) to the array of trusted proxies.

If your Symfony application runs behind a reverse proxy and it's served in a subpath/subfolder, Symfony might generate incorrect URLs that ignore the subpath/subfolder of the reverse proxy.

To fix this, you need to pass the subpath/subfolder route prefix of the reverse proxy to Symfony by setting the X-Forwarded-Prefix header. The header can normally be configured in your reverse proxy configuration. Configure X-Forwarded-Prefix as trusted header to be able to use this feature.

The X-Forwarded-Prefix is used by Symfony to prefix the base URL of request objects, which is used to generate absolute paths and URLs in Symfony applications. Without the header, the base URL would be only determined based on the configuration of the web server running Symfony, which leads to incorrect paths/URLs, when the application is served under a subpath/subfolder by a reverse proxy.

For example if your Symfony application is directly served under a URL like https://symfony.tld/ and you would like to use a reverse proxy to serve the application under https://public.tld/app/, you would need to set the X-Forwarded-Prefix header to /app/ in your reverse proxy configuration. Without the header, Symfony would generate URLs based on its server base URL (e.g. /my/route) instead of the correct /app/my/route, which is required to access the route via the reverse proxy.

The header can be different for each reverse proxy, so that access via different reverse proxies served under different subpaths/subfolders can be handled correctly.

Some reverse proxies (like CloudFront with CloudFront-Forwarded-Proto) may force you to use a custom header. For instance you have Custom-Forwarded-Proto instead of X-Forwarded-Proto.

In this case, you'll need to set the header X-Forwarded-Proto with the value of Custom-Forwarded-Proto early enough in your application, i.e. before handling the request:

Some cloud setups (like running a Docker container with the "Web App for Containers" in Microsoft Azure) do SSL termination and contact your web server over HTTP, but do not change the remote address nor set the X-Forwarded-* headers. This means the trusted proxy feature of Symfony can't help you.

Once you made sure your server is only reachable through the cloud proxy over HTTPS and not through HTTP, you can override the information your web server sends to PHP. For Nginx, this could look like this:

Show your Sylius expertise

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (yaml):
```yaml
# config/packages/framework.yaml
framework:
    # ...
    # the IP address (or range) of your proxy
    trusted_proxies: '192.0.0.1,10.0.0.0/8'
    # shortcut for private IP address ranges of your proxy
    trusted_proxies: 'private_ranges'
    # trust *all* "X-Forwarded-*" headers
    trusted_headers: ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-forwarded-prefix']
    # or, if your proxy instead uses the "Forwarded" header
    trusted_headers: ['forwarded']
```

Example 2 (xml):
```xml
<!-- config/packages/framework.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <framework:config>
        <!-- the IP address (or range) of your proxy -->
        <framework:trusted-proxies>192.0.0.1,10.0.0.0/8</framework:trusted-proxies>
        <!-- shortcut for private IP address ranges of your proxy -->
        <framework:trusted-proxies>private_ranges</framework:trusted-proxies>

        <!-- trust *all* "X-Forwarded-*" headers -->
        <framework:trusted-header>x-forwarded-for</framework:trusted-header>
        <framework:trusted-header>x-forwarded-host</framework:trusted-header>
        <framework:trusted-header>x-forwarded-proto</framework:trusted-header>
        <framework:trusted-header>x-forwarded-port</framework:trusted-header>
        <framework:trusted-header>x-forwarded-prefix</framework:trusted-header>

        <!-- or, if your proxy instead uses the "Forwarded" header -->
        <framework:trusted-header>forwarded</framework:trusted-header>
    </framework:config>
</container>
```

Example 3 (php):
```php
// config/packages/framework.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    $framework
        // the IP address (or range) of your proxy
        ->trustedProxies('192.0.0.1,10.0.0.0/8')
        // shortcut for private IP address ranges of your proxy
        ->trustedProxies('private_ranges')
        // trust *all* "X-Forwarded-*" headers (the ! prefix means to not trust those headers)
        ->trustedHeaders(['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-forwarded-prefix'])
        // or, if your proxy instead uses the "Forwarded" header
        ->trustedHeaders(['forwarded'])
    ;
};
```

Example 4 (markdown):
```markdown
# .env
TRUSTED_PROXIES=127.0.0.1,10.0.0.0/8
```

---
