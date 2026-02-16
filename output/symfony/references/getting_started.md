# Symfony - Getting Started

**Pages:** 3

---

## How to Define Controllers as Services

**URL:** https://symfony.com/doc/7.4/controller/service.html

**Contents:**
- How to Define Controllers as Services
- Using the #[Route] Attribute
- Using the #[AsController] Attribute
- Using the controller.service_arguments Service Tag
- Invokable Controllers
- Alternatives to base Controller Methods
  - Base Controller Methods and Their Service Replacements
- Controller Allowlist

In Symfony, a controller does not need to be registered as a service. But if you're using the default services.yaml configuration, and your controllers extend the AbstractController class, they are automatically registered as services. This means you can use dependency injection like any other normal service.

If you prefer to not extend the AbstractController class, you can register your controllers as services in several ways:

When using the #[Route] attribute to define routes on any PHP class, Symfony treats that class as a controller. It registers it as a public, non-lazy service and enables service argument injection in all its methods.

This is the simplest and recommended way to register controllers as services when not extending the base controller class.

The feature to register controllers as services when using the #[Route] attribute was introduced in Symfony 7.3.

If you prefer, you can use the #[AsController] PHP attribute to automatically apply the controller.service_arguments tag to your controller services:

When using the #[Route] attribute, Symfony already registers the controller class as a service, so using the #[AsController] attribute is redundant.

If your controllers don't extend the AbstractController class and you don't use the #[AsController] or #[Route] attributes, you must register the controllers as public services manually and apply the controller.service_arguments service tag to enable service injection in controller actions:

If you don't use either autowiring or autoconfiguration and you extend the AbstractController, you'll need to apply other tags and make some method calls to register your controllers as services:

Registering your controller as a service is the first step, but you also need to update your routing config to reference the service properly, so that Symfony knows to use it.

Use the service_id::method_name syntax to refer to the controller method. If the service id is the fully-qualified class name (FQCN) of your controller, as Symfony recommends, then the syntax is the same as if the controller was not a service like: App\Controller\HelloController::index:

Controllers can also define a single action using the __invoke() method, which is a common practice when following the ADR pattern (Action-Domain-Responder):

When using a controller defined as a service, you can still extend the AbstractController base controller and use its shortcuts. But, you don't need to! You can choose to extend nothing, and use dependency injection to access different services.

The base Controller class source code is a great way to see how to accomplish common tasks. For example, $this->render() is usually used to render a Twig template and return a Response. But, you can also do this directly:

In a controller that's defined as a service, you can instead inject the twig service and use it directly:

You can also use a special action-based dependency injection to receive services as arguments to your controller action methods.

The best way to see how to replace base Controller convenience methods is to look at the AbstractController class that holds its logic.

If you want to know what type-hints to use for each service, see the getSubscribedServices() method in AbstractController.

For security reasons, Symfony maintains an allowlist of controllers that are permitted to handle requests. Controllers that are not in this list will be rejected when Symfony needs to verify their legitimacy (e.g. when rendering ESI fragments or using the fragment renderer).

The following controllers are automatically allowed:

If you use the #[Route] attribute on a class, Symfony already registers it as a service with the controller.service_arguments tag, so it is automatically allowed.

For bundle authors or advanced use cases where a controller does not match any of these criteria, call the allowControllers() method on the controller_resolver service to register additional controller types or attributes:

The allowControllers() method accepts two arguments: an array of class names ($types) and an array of attribute class names ($attributes). A controller is allowed if it is an instance of one of the given types or if its class has one of the given attributes.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Put the code quality back at the heart of your project

**Examples:**

Example 1 (php):
```php
// src/Controller/HelloController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class HelloController
{
    #[Route('/hello', name: 'hello', methods: ['GET'])]
    public function index(): Response
    {
        // ...
    }
}
```

Example 2 (php):
```php
# config/services.yaml

# controllers are imported separately to make sure services can be injected
# as action arguments even if you don't extend any base controller class
App\Controller\:
   resource: '../src/Controller/'
   tags: ['controller.service_arguments']
```

Example 3 (markdown):
```markdown
# config/services.yaml

# this extended configuration is only required when not using autowiring/autoconfiguration,
# which is uncommon and not recommended

abstract_controller.locator:
    class: Symfony\Component\DependencyInjection\ServiceLocator
    arguments:
        -
            router: '@router'
            request_stack: '@request_stack'
            http_kernel: '@http_kernel'
            session: '@session'
            parameter_bag: '@parameter_bag'
            # you can add more services here as you need them (e.g. the `serializer`
            # service) and have a look at the AbstractController class to see
            # which services are defined in the locator

App\Controller\:
    resource: '../src/Controller/'
    tags: ['controller.service_arguments']
    calls:
        - [setContainer, ['@abstract_controller.locator']]
```

Example 4 (php):
```php
// src/Controller/HelloController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HelloController
{
    #[Route('/hello', name: 'hello', methods: ['GET'])]
    public function index(): Response
    {
        // ...
    }
}
```

---

## Understanding how the Front Controller, Kernel and Environments Work together

**URL:** https://symfony.com/doc/7.4/configuration/front_controllers_and_kernel.html

**Contents:**
- Understanding how the Front Controller, Kernel and Environments Work together
- The Front Controller
- The Kernel Class
  - Debug Mode
- The Environments
  - Environments and the Cache Directory

The configuration environments section explained the basics on how Symfony uses environments to run your application with different configuration settings. This section will explain a bit more in-depth what happens when your application is bootstrapped. To hook into this process, you need to understand three parts that work together:

Usually, you will not need to define your own front controller or Kernel class as Symfony provides sensible default implementations. This article is provided to explain what is going on internally.

The front controller is a design pattern; it is a section of code that all requests served by an application run through.

In the Symfony Skeleton, this role is taken by the index.php file in the public/ directory. This is the very first PHP script that is run when a request is processed.

The main purpose of the front controller is to create an instance of the Kernel (more on that in a second), make it handle the request and return the resulting response to the browser.

Because every request is routed through it, the front controller can be used to perform global initialization prior to setting up the kernel or to decorate the kernel with additional features. Examples include:

You can choose the front controller that's used by adding it in the URL, like:

As you can see, this URL contains the PHP script to be used as the front controller. You can use that to switch to a custom made front controller that is located in the public/ directory.

You almost never want to show the front controller in the URL. This is achieved by configuring the web server, as shown in Configuring a Web Server.

Technically, the bin/console script used when running Symfony on the command line is also a front controller, only that is not used for web, but for command line requests.

The Kernel is the core of Symfony. It is responsible for setting up all the bundles used by your application and providing them with the application's configuration. It then creates the service container before serving requests in its handle() method.

The kernel used in Symfony applications extends from Kernel and uses the MicroKernelTrait. The Kernel class leaves some methods from KernelInterface unimplemented and the MicroKernelTrait defines several abstract methods, so you must implement them all:

To fill these (small) blanks, your application needs to extend the Kernel class and use the MicroKernelTrait to implement these methods. Symfony provides by default that kernel in the src/Kernel.php file.

This class uses the name of the environment - which is passed to the Kernel's constructor method and is available via getEnvironment() - to decide which bundles to enable. The logic for that is in registerBundles().

You are free to create your own, alternative or additional Kernel variants. All you need is to adapt your (or add a new) front controller to make use of the new kernel.

The name and location of the Kernel is not fixed. When putting multiple kernels into a single application, it might therefore make sense to add additional sub-directories, for example src/admin/AdminKernel.php and src/api/ApiKernel.php. All that matters is that your front controller is able to create an instance of the appropriate kernel.

There's a lot more the Kernel can be used for, for example overriding the default directory structure. But odds are high that you don't need to change things like this on the fly by having several Kernel implementations.

The second argument to the Kernel constructor specifies if the application should run in "debug mode". Regardless of the configuration environment, a Symfony application can be run with debug mode set to true or false.

This affects many things in the application, such as displaying stack traces on error pages or if cache files are dynamically rebuilt on each request. Though not a requirement, debug mode is generally set to true for the dev and test environments and false for the prod environment.

Similar to configuring the environment you can also enable/disable the debug mode using the .env file:

This value can be overridden for commands by passing the APP_DEBUG value before running them:

Internally, the value of the debug mode becomes the kernel.debug parameter used inside the service container. If you look inside the application configuration file, you'll see the parameter used, for example, to turn Twig's debug mode on:

As mentioned above, the Kernel has to implement another method - configureContainer(). This method is responsible for loading the application's configuration from the right environment.

Configuration environments allow you to execute the same code using different configuration. Symfony provides three environments by default called dev, prod and test.

More technically, these names are nothing more than strings passed from the front controller to the Kernel's constructor. This name can then be used in the configureContainer() method to decide which configuration files to load.

Symfony's default Kernel class implements this method by loading first the config files found on config/packages/* and then, the files found on config/packages/ENVIRONMENT_NAME/. You are free to implement this method differently if you need a more sophisticated way of loading your configuration.

Symfony takes advantage of caching in many ways: the application configuration, routing configuration, Twig templates and more are cached to PHP objects stored in files on the filesystem.

By default, these cached files are largely stored in the var/cache/ directory. However, each environment caches its own set of files:

Sometimes, when debugging, it may be helpful to inspect a cached file to understand how something is working. When doing so, remember to look in the directory of the environment you're using (most commonly dev/ while developing and debugging). While it can vary, the var/cache/dev/ directory includes the following:

You can change the cache directory location and name. For more information read the article How to Override Symfony's default Directory Structure.

Check Code Performance in Dev, Test, Staging & Production

Make sure your project is risk free

**Examples:**

Example 1 (yaml):
```yaml
http://localhost/index.php/some/path/...
```

Example 2 (markdown):
```markdown
# .env
# set it to 1 to enable the debug mode
APP_DEBUG=0
```

Example 3 (markdown):
```markdown
# Use the debug mode defined in the .env file
$ php bin/console command_name

# Ignore the .env file and enable the debug mode for this command
$ APP_DEBUG=1 php bin/console command_name
```

Example 4 (yaml):
```yaml
# config/packages/twig.yaml
twig:
    debug: '%kernel.debug%'
```

---

## Installing Encore

**URL:** https://symfony.com/doc/7.4/frontend/encore/installation.html

**Contents:**
- Installing Encore
- Installing Encore in Symfony Applications
- Installing Encore in non Symfony Applications
  - Creating the webpack.config.js File
  - Creating Other Supporting File

First, make sure you install Node.js. Then, follow the instructions below, which depend on whether you are installing Encore in a Symfony application or not.

Run these commands to install both the PHP and JavaScript dependencies in your project:

If you are using Symfony Flex, this will install and enable the WebpackEncoreBundle, create the assets/ directory, add a webpack.config.js file, and add node_modules/ to .gitignore. You can skip the rest of this article and go write your first JavaScript and CSS by reading Encore: Setting up your Project!

If you are not using Symfony Flex, you'll need to create all these directories and files by yourself following the instructions shown in the next section.

Install Encore into your project via npm:

This command creates (or modifies) a package.json file and downloads dependencies into a node_modules/ directory.

You should commit package.json and package-lock.json to version control, but ignore node_modules/.

Next, create a new webpack.config.js file at the root of your project. This is the main config file for both Webpack and Webpack Encore:

Next, open the new assets/app.js file which contains some JavaScript code and imports some CSS:

And the new assets/styles/app.css file:

You should also add an assets/bootstrap.js file, which initializes Stimulus: a system that you'll learn about soon:

Then create an assets/controllers.json file, which also fits into the Stimulus system:

Finally, though it's optional, add the following scripts to your package.json file so you can run the same commands in the rest of the documentation:

You'll customize and learn more about these files in Encore: Setting up your Project. When you execute Encore, it will ask you to install a few more dependencies based on which features of Encore you have enabled.

Some of the documentation will use features that are specific to Symfony or Symfony's WebpackEncoreBundle. These are optional, and are special ways of pointing to the asset paths generated by Encore that enable features like versioning and split chunks.

Symfony Code Performance Profiling

Get your Sylius expertise recognized

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/webpack-encore-bundle
$ npm install
```

Example 2 (python):
```python
$ npm install @symfony/webpack-encore --save-dev
```

Example 3 (javascript):
```javascript
const Encore = require('@symfony/webpack-encore');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')
    // only needed for CDN's or sub-directory deploy
    //.setManifestKeyPrefix('build/')

    /*
     * ENTRY CONFIG
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
     */
    .addEntry('app', './assets/app.js')

    // enables the Symfony UX Stimulus bridge (used in assets/bootstrap.js)
    .enableStimulusBridge('./assets/controllers.json')

    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    .splitEntryChunks()

    // will require an extra script tag for runtime.js
    // but, you probably want this, unless you're building a single-page app
    .enableSingleRuntimeChunk()

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    .configureBabel((config) => {
        config.plugins.push('@babel/plugin-transform-class-properties');
    })

    // enables @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })

    // enables Sass/SCSS support
    //.enableSassLoader()

    // uncomment if you use TypeScript
    //.enableTypeScriptLoader()

    // uncomment if you use React
    //.enableReactPreset()

    // uncomment to get integrity="..." attributes on your script & link tags
    // requires WebpackEncoreBundle 1.4 or higher
    //.enableIntegrityHashes(Encore.isProduction())

    // uncomment if you're having problems with a jQuery plugin
    //.autoProvidejQuery()
;

module.exports = Encore.getWebpackConfig();
```

Example 4 (swift):
```swift
// assets/app.js
/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';

// start the Stimulus application
import './bootstrap';
```

---
