# Symfony - Architecture

**Pages:** 21

---

## The HttpKernel Component

**URL:** https://symfony.com/doc/7.4/components/http_kernel.html

**Contents:**
- The HttpKernel Component
- Installation
- The Request-Response Lifecycle
  - HttpKernel: Driven by Events
  - 1) The kernel.request Event
  - 2) Resolve the Controller
  - 3) The kernel.controller Event
  - 4) Getting the Controller Arguments
  - 5) Calling the Controller
  - 6) The kernel.view Event

The HttpKernel component provides a structured process for converting a Request into a Response by making use of the EventDispatcher component. It's flexible enough to create a full-stack framework (Symfony) or an advanced CMS (Drupal).

If you install this component outside of a Symfony application, you must require the vendor/autoload.php file in your code to enable the class autoloading mechanism provided by Composer. Read this article for more details.

This article explains how to use the HttpKernel features as an independent component in any PHP application. In Symfony applications everything is already configured and ready to use. Read the Controller and Events and Event Listeners articles to learn about how to use it to create controllers and define events in Symfony applications.

Every HTTP web interaction begins with a request and ends with a response. Your job as a developer is to create PHP code that reads the request information (e.g. the URL) and creates and returns a response (e.g. an HTML page or JSON string). This is a simplified overview of the request-response lifecycle in Symfony applications:

Typically, some sort of framework or system is built to handle all the repetitive tasks (e.g. routing, security, etc) so that a developer can build each page of the application. Exactly how these systems are built varies greatly. The HttpKernel component provides an interface that formalizes the process of starting with a request and creating the appropriate response. The component is meant to be the heart of any application or framework, no matter how varied the architecture of that system:

Internally, HttpKernel::handle() - the concrete implementation of HttpKernelInterface::handle() - defines a lifecycle that starts with a Request and ends with a Response.

The exact details of this lifecycle are the key to understanding how the kernel (and the Symfony Framework or any other library that uses the kernel) works.

The HttpKernel::handle() method works internally by dispatching events. This makes the method both flexible, but also a bit abstract, since all the "work" of a framework/application built with HttpKernel is actually done in event listeners.

To help explain this process, this document looks at each step of the process and talks about how one specific implementation of the HttpKernel - the Symfony Framework - works.

Initially, using the HttpKernel does not take many steps. You create an event dispatcher and a controller and argument resolver (explained below). To complete your working kernel, you'll add more event listeners to the events discussed below:

See "A full working example" for a more concrete implementation.

For general information on adding listeners to the events below, see Creating an Event Listener.

There is a wonderful tutorial series on using the HttpKernel component and other Symfony components to create your own framework. See Introduction.

Typical Purposes: To add more information to the Request, initialize parts of the system, or return a Response if possible (e.g. a security layer that denies access).

Kernel Events Information Table

The first event that is dispatched inside HttpKernel::handle is kernel.request, which may have a variety of different listeners.

Listeners of this event can be quite varied. Some listeners - such as a security listener - might have enough information to create a Response object immediately. For example, if a security listener determined that a user doesn't have access, that listener may return a RedirectResponse to the login page or a 403 Access Denied response.

If a Response is returned at this stage, the process skips directly to the kernel.response event.

Other listeners initialize things or add more information to the request. For example, a listener might determine and set the locale on the Request object.

Another common listener is routing. A router listener may process the Request and determine the controller that should be rendered (see the next section). In fact, the Request object has an "attributes" bag which is a perfect spot to store this extra, application-specific data about the request. This means that if your router listener somehow determines the controller, it can store it on the Request attributes (which can be used by your controller resolver).

Overall, the purpose of the kernel.request event is either to create and return a Response directly, or to add information to the Request (e.g. setting the locale or setting some other information on the Request attributes).

When setting a response for the kernel.request event, the propagation is stopped. This means listeners with lower priority won't be executed.

kernel.request in the Symfony Framework

The most important listener to kernel.request in the Symfony Framework is the RouterListener. This class executes the routing layer, which returns an array of information about the matched request, including the _controller and any placeholders that are in the route's pattern (e.g. {slug}). See the Routing documentation.

This array of information is stored in the Request object's attributes array. Adding the routing information here doesn't do anything yet, but is used next when resolving the controller.

Assuming that no kernel.request listener was able to create a Response, the next step in HttpKernel is to determine and prepare (i.e. resolve) the controller. The controller is the part of the end-application's code that is responsible for creating and returning the Response for a specific page. The only requirement is that it is a PHP callable - i.e. a function, method on an object or a Closure.

But how you determine the exact controller for a request is entirely up to your application. This is the job of the "controller resolver" - a class that implements ControllerResolverInterface and is one of the constructor arguments to HttpKernel.

Your job is to create a class that implements the interface and fill in its method: getController(). In fact, one default implementation already exists, which you can use directly or learn from: ControllerResolver. This implementation is explained more in the sidebar below:

Internally, the HttpKernel::handle() method first calls getController() on the controller resolver. This method is passed the Request and is responsible for somehow determining and returning a PHP callable (the controller) based on the request's information.

Resolving the Controller in the Symfony Framework

The Symfony Framework uses the built-in ControllerResolver class (actually, it uses a subclass with some extra functionality mentioned below). This class leverages the information that was placed on the Request object's attributes property during the RouterListener.

The ControllerResolver looks for a _controller key on the Request object's attributes property (recall that this information is typically placed on the Request via the RouterListener). This string is then transformed into a PHP callable by doing the following:

Typical Purposes: Initialize things or change the controller just before the controller is executed.

Kernel Events Information Table

After the controller callable has been determined, HttpKernel::handle() dispatches the kernel.controller event. Listeners to this event might initialize some part of the system that needs to be initialized after certain things have been determined (e.g. the controller, routing information) but before the controller is executed.

Another typical use-case for this event is to retrieve the attributes from the controller using the getAttributes() method. See the Symfony section below for some examples.

Listeners to this event can also change the controller callable completely by calling ControllerEvent::setController on the event object that's passed to listeners on this event.

kernel.controller in the Symfony Framework

An interesting listener to kernel.controller in the Symfony Framework is CacheAttributeListener. This class fetches #[Cache] attribute configuration from the controller and uses it to configure HTTP caching on the response.

There are a few other minor listeners to the kernel.controller event in the Symfony Framework that deal with collecting profiler data when the profiler is enabled.

Next, HttpKernel::handle() calls ArgumentResolverInterface::getArguments(). Remember that the controller returned in getController() is a callable. The purpose of getArguments() is to return the array of arguments that should be passed to that controller. Exactly how this is done is completely up to your design, though the built-in ArgumentResolver is a good example.

At this point the kernel has a PHP callable (the controller) and an array of arguments that should be passed when executing that callable.

Getting the Controller Arguments in the Symfony Framework

Now that you know exactly what the controller callable (usually a method inside a controller object) is, the ArgumentResolver uses reflection on the callable to return an array of the names of each of the arguments. It then iterates over each of these arguments and uses the following tricks to determine which value should be passed for each argument:

This functionality is provided by resolvers implementing the ValueResolverInterface. There are four implementations which provide the default behavior of Symfony but customization is the key here. By implementing the ValueResolverInterface yourself and passing this to the ArgumentResolver, you can extend this functionality.

The next step of HttpKernel::handle() is executing the controller.

The job of the controller is to build the response for the given resource. This could be an HTML page, a JSON string or anything else. Unlike every other part of the process so far, this step is implemented by the "end-developer", for each page that is built.

Usually, the controller will return a Response object. If this is true, then the work of the kernel is just about done! In this case, the next step is the kernel.response event.

But if the controller returns anything besides a Response, then the kernel has a little bit more work to do - kernel.view (since the end goal is always to generate a Response object).

A controller must return something. If a controller returns null, an exception will be thrown immediately.

Typical Purposes: Transform a non-Response return value from a controller into a Response

Kernel Events Information Table

If the controller doesn't return a Response object, then the kernel dispatches another event - kernel.view. The job of a listener to this event is to use the return value of the controller (e.g. an array of data or an object) to create a Response.

This can be useful if you want to use a "view" layer: instead of returning a Response from the controller, you return data that represents the page. A listener to this event could then use this data to create a Response that is in the correct format (e.g HTML, JSON, etc).

At this stage, if no listener sets a response on the event, then an exception is thrown: either the controller or one of the view listeners must always return a Response.

When setting a response for the kernel.view event, the propagation is stopped. This means listeners with lower priority won't be executed.

kernel.view in the Symfony Framework

There is a default listener inside the Symfony Framework for the kernel.view event. If your controller action returns an array, and you apply the #[Template] attribute to that controller action, then this listener renders a template, passes the array you returned from your controller to that template, and creates a Response containing the returned content from that template.

Additionally, a popular community bundle FOSRestBundle implements a listener on this event which aims to give you a robust view layer capable of using a single controller to return many different content-type responses (e.g. HTML, JSON, XML, etc).

Typical Purposes: Modify the Response object just before it is sent

Kernel Events Information Table

The end goal of the kernel is to transform a Request into a Response. The Response might be created during the kernel.request event, returned from the controller, or returned by one of the listeners to the kernel.view event.

Regardless of who creates the Response, another event - kernel.response is dispatched directly afterwards. A typical listener to this event will modify the Response object in some way, such as modifying headers, adding cookies, or even changing the content of the Response itself (e.g. injecting some JavaScript before the end </body> tag of an HTML response).

After this event is dispatched, the final Response object is returned from handle(). In the most typical use-case, you can then call the send() method, which sends the headers and prints the Response content.

kernel.response in the Symfony Framework

There are several minor listeners on this event inside the Symfony Framework, and most modify the response in some way. For example, the WebDebugToolbarListener injects some JavaScript at the bottom of your page in the dev environment which causes the web debug toolbar to be displayed. Another listener, ContextListener serializes the current user's information into the session so that it can be reloaded on the next request.

Typical Purposes: To perform some "heavy" action after the response has been streamed to the user

Kernel Events Information Table

The final event of the HttpKernel process is kernel.terminate and is unique because it occurs after the HttpKernel::handle() method, and after the response is sent to the user. Recall from above, then the code that uses the kernel, ends like this:

As you can see, by calling $kernel->terminate after sending the response, you will trigger the kernel.terminate event where you can perform certain actions that you may have delayed in order to return the response as quickly as possible to the client (e.g. sending emails).

Internally, the HttpKernel makes use of the fastcgi_finish_request PHP function. This means that at the moment, only the PHP FPM API and the FrankenPHP server are able to send a response to the client while the server's PHP process still performs some tasks. With all other server APIs, listeners to kernel.terminate are still executed, but the response is not sent to the client until they are all completed.

Using the kernel.terminate event is optional, and should only be called if your kernel implements TerminableInterface.

Typical Purposes: Handle some type of exception and create an appropriate Response to return for the exception

Kernel Events Information Table

If an exception is thrown at any point inside HttpKernel::handle(), another event - kernel.exception is dispatched. Internally, the body of the handle() method is wrapped in a try-catch block. When any exception is thrown, the kernel.exception event is dispatched so that your system can somehow respond to the exception.

Each listener to this event is passed a ExceptionEvent object, which you can use to access the original exception via the getThrowable() method. A typical listener on this event will check for a certain type of exception and create an appropriate error Response.

For example, to generate a 404 page, you might throw a special type of exception and then add a listener on this event that looks for this exception and creates and returns a 404 Response. In fact, the HttpKernel component comes with an ErrorListener, which if you choose to use, will do this and more by default (see the sidebar below for more details).

The ExceptionEvent exposes the isKernelTerminating() method, which you can use to determine if the kernel is currently terminating at the moment the exception was thrown.

The isKernelTerminating() method was introduced in Symfony 7.1.

When setting a response for the kernel.exception event, the propagation is stopped. This means listeners with lower priority won't be executed.

kernel.exception in the Symfony Framework

There are two main listeners to kernel.exception when using the Symfony Framework.

ErrorListener in the HttpKernel Component

The first comes core to the HttpKernel component and is called ErrorListener. The listener has several goals:

ExceptionListener in the Security Component

The other important listener is the ExceptionListener. The goal of this listener is to handle security exceptions and, when appropriate, help the user to authenticate (e.g. redirect to the login page).

As you've seen, you can create and attach event listeners to any of the events dispatched during the HttpKernel::handle() cycle. Typically a listener is a PHP class with a method that's executed, but it can be anything. For more information on creating and attaching event listeners, see The EventDispatcher Component.

The name of each of the "kernel" events is defined as a constant on the KernelEvents class. Additionally, each event listener is passed a single argument, which is some subclass of KernelEvent. This object contains information about the current state of the system and each event has their own event object:

When using the HttpKernel component, you're free to attach any listeners to the core events, use any controller resolver that implements the ControllerResolverInterface and use any argument resolver that implements the ArgumentResolverInterface. However, the HttpKernel component comes with some built-in listeners and everything else that can be used to create a working example:

In addition to the "main" request that's sent into HttpKernel::handle(), you can also send a so-called "sub request". A sub request looks and acts like any other request, but typically serves to render just one small portion of a page instead of a full page. You'll most commonly make sub-requests from your controller (or perhaps from inside a template, that's being rendered by your controller).

To execute a sub request, use HttpKernel::handle(), but change the second argument as follows:

This creates another full request-response cycle where this new Request is transformed into a Response. The only difference internally is that some listeners (e.g. security) may only act upon the main request. Each listener is passed some subclass of KernelEvent, whose isMainRequest() method can be used to check if the current request is a "main" or "sub" request.

For example, a listener that only needs to act on the main request may look like this:

The default value of the _format request attribute is html. If your sub request returns a different format (e.g. json) you can set it by defining the _format attribute explicitly on the request:

The HttpKernel component is responsible of the bundle mechanism used in Symfony applications. One of the key features of the bundles is that you can use logic paths instead of physical paths to refer to any of their resources (config files, templates, controllers, translation files, etc.)

This allows you to import resources even if you don't know where in the filesystem a bundle will be installed. For example, the services.xml file stored in the Resources/config/ directory of a bundle called FooBundle can be referenced as @FooBundle/Resources/config/services.xml instead of __DIR__/Resources/config/services.xml.

This is possible thanks to the locateResource() method provided by the kernel, which transforms logical paths into physical paths:

Symfony Code Performance Profiling

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/http-kernel
```

Example 2 (php):
```php
namespace Symfony\Component\HttpKernel;

use Symfony\Component\HttpFoundation\Request;

interface HttpKernelInterface
{
    // ...

    /**
     * @return Response A Response instance
     */
    public function handle(
        Request $request,
        int $type = self::MAIN_REQUEST,
        bool $catch = true
    ): Response;
}
```

Example 3 (php):
```php
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Controller\ArgumentResolver;
use Symfony\Component\HttpKernel\Controller\ControllerResolver;
use Symfony\Component\HttpKernel\HttpKernel;

// create the Request object
$request = Request::createFromGlobals();

$dispatcher = new EventDispatcher();
// ... add some event listeners

// create your controller and argument resolvers
$controllerResolver = new ControllerResolver();
$argumentResolver = new ArgumentResolver();

// instantiate the kernel
$kernel = new HttpKernel($dispatcher, $controllerResolver, new RequestStack(), $argumentResolver);

// actually execute the kernel, which turns the request into a response
// by dispatching events, calling a controller, and returning the response
$response = $kernel->handle($request);

// send the headers and echo the content
$response->send();

// trigger the kernel.terminate event
$kernel->terminate($request, $response);
```

Example 4 (php):
```php
namespace Symfony\Component\HttpKernel\Controller;

use Symfony\Component\HttpFoundation\Request;

interface ControllerResolverInterface
{
    public function getController(Request $request): callable|false;
}
```

---

## Configuring in the Kernel

**URL:** https://symfony.com/doc/7.4/reference/configuration/kernel.html

**Contents:**
- Configuring in the Kernel
- kernel.build_dir
- kernel.bundles
- kernel.bundles_metadata
- kernel.cache_dir
- kernel.charset
- kernel.container_build_time
- kernel.container_class
- kernel.debug
- kernel.default_locale

Symfony applications define a kernel class (which is located by default at src/Kernel.php) that includes several configurable options. This article explains how to configure those options and shows the list of container parameters created by Symfony based on that configuration.

type: string default: $this->getCacheDir()

This parameter stores the absolute path of a build directory of your Symfony application. This directory can be used to separate read-only cache (i.e. the compiled container) from read-write cache (i.e. cache pools). Specify a non-default value when the application is deployed in a read-only filesystem like a Docker container or AWS Lambda.

This value is also exposed via the getBuildDir() method of the kernel class, which you can override to return a different value.

You can also change the build directory by defining an environment variable named APP_BUILD_DIR whose value is the absolute path of the build folder.

type: array default: []

This parameter stores the list of bundles registered in the application and the FQCN of their main bundle class:

This value is also exposed via the getBundles() method of the kernel class.

type: array default: []

This parameter stores the list of bundles registered in the application and some metadata about them:

This value is not exposed via any method of the kernel class, so you can only obtain it via the container parameter.

type: string default: $this->getProjectDir()/var/cache/$this->environment

This parameter stores the absolute path of the cache directory of your Symfony application. The default value is generated by Symfony based on the current configuration environment. Your application can write data to this path at runtime.

This value is also exposed via the getCacheDir() method of the kernel class, which you can override to return a different value.

type: string default: UTF-8

This parameter stores the type of charset or character encoding that is used in the application. This value is also exposed via the getCharset() method of the kernel class, which you can override to return a different value:

type: string default: the result of executing time()

Symfony follows the reproducible builds philosophy, which ensures that the result of compiling the exact same source code doesn't produce different results. This helps checking that a given binary or executable code was compiled from some trusted source code.

In practice, the compiled service container of your application will always be the same if you don't change its source code. This is exposed via these container parameters:

Since the container.build_time value will change every time you compile the application, the build will not be strictly reproducible. If you care about this, the solution is to use another container parameter called kernel.container_build_time and set it to a non-changing build time to achieve a strict reproducible build:

type: string default: (see explanation below)

This parameter stores a unique identifier for the container class. In practice, this is only important to ensure that each kernel has a unique identifier when using applications with multiple kernels.

The default value is generated by Symfony based on the current configuration environment and the debug mode. For example, if your application kernel is defined in the App namespace, runs in the dev environment and the debug mode is enabled, the value of this parameter is App_KernelDevDebugContainer.

This value is also exposed via the getContainerClass() method of the kernel class, which you can override to return a different value:

type: boolean default: (the value is passed as an argument when booting the kernel)

This parameter stores the value of the current debug mode used by the application.

This parameter stores the value of the framework.default_locale parameter.

This parameter stores the value of the framework.enabled_locales parameter.

type: string default: (the value is passed as an argument when booting the kernel)

This parameter stores the name of the current configuration environment used by the application.

This value defines the configuration options used to run the application, whereas the kernel.runtime_environment option defines the place where the application is deployed. This allows for example to run an application with the prod config (kernel.environment) in different scenarios like staging or production (kernel.runtime_environment).

This parameter stores the value of the framework.error_controller parameter.

This parameter stores the value of the framework.http_method_override parameter.

This parameter stores the value of the framework.allowed_http_method_override parameter.

The kernel.allowed_http_method_override parameter was introduced in Symfony 7.4.

type: string default: $this->getProjectDir()/var/log

This parameter stores the absolute path of the log directory of your Symfony application. It's calculated automatically based on the current configuration environment.

This value is also exposed via the getLogDir() method of the kernel class, which you can override to return a different value.

type: string default: the directory of the project's composer.json

This parameter stores the absolute path of the root directory of your Symfony application, which is used by applications to perform operations with file paths relative to the project's root directory.

By default, its value is calculated automatically as the directory where the main composer.json file is stored. This value is also exposed via the getProjectDir() method of the kernel class.

If you don't use Composer, or have moved the composer.json file location or have deleted it entirely (for example in the production servers), override the getProjectDir() method to return a different value:

type: string default: %env(default:kernel.environment:APP_RUNTIME_ENV)%

This parameter stores the name of the current runtime environment used by the application.

This value defines the place where the application is deployed, whereas the kernel.environment option defines the configuration options used to run the application. This allows for example to run an application with the prod config (kernel.environment) in different scenarios like staging or production (kernel.runtime_environment).

type: string default: %env(query_string:default:container.runtime_mode:APP_RUNTIME_MODE)%

This parameter stores a query string of the current runtime mode used by the application. For example, the query string looks like web=1&worker=0 when the application is running in web mode and web=1&worker=1 when running in a long-running web server. This parameter can be set by using the APP_RUNTIME_MODE env var.

type: boolean default: %env(bool:default::key:web:default:kernel.runtime_mode:)%

Whether the application is running in a web environment.

type: boolean default: %env(not:default:kernel.runtime_mode.web:)%

Whether the application is running in a CLI environment. By default, this value is the opposite of the kernel.runtime_mode.web parameter.

type: boolean default: %env(bool:default::key:worker:default:kernel.runtime_mode:)%

Whether the application is running in a worker/long-running environment. Not all web servers support it, and you have to use a long-running web server like FrankenPHP.

type: string default: %env(APP_SECRET)%

This parameter stores the value of the framework.secret parameter.

type: string default: $this->getCacheDir()

This parameter stores the absolute path of the shared cache directory of your Symfony application. The default value is the current cache directory.

This value is also exposed via the getShareDir() method of the kernel class, which you can override to return a different value.

The Kernel::getShareDir() method and the %kernel.share_dir parameter were introduced in Symfony 7.4.

This parameter stores the value of the framework.trust_x_sendfile_type_header parameter.

This parameter stores the value of the framework.trusted_headers parameter.

This parameter stores the value of the framework.trusted_hosts parameter.

This parameter stores the value of the framework.trusted_proxies parameter.

Symfony Code Performance Profiling

Save your teams and projects before they sink

**Examples:**

Example 1 (json):
```json
[
    'FrameworkBundle' => 'Symfony\Bundle\FrameworkBundle\FrameworkBundle',
    'TwigBundle' => 'Symfony\Bundle\TwigBundle\TwigBundle',
    // ...
]
```

Example 2 (json):
```json
[
    'FrameworkBundle' => [
        'path' => '/<path-to-your-project>/vendor/symfony/framework-bundle',
        'namespace' => 'Symfony\Bundle\FrameworkBundle',
    ],
    'TwigBundle' => [
        'path' => '/<path-to-your-project>/vendor/symfony/twig-bundle',
        'namespace' => 'Symfony\Bundle\TwigBundle',
    ],
    // ...
]
```

Example 3 (php):
```php
// src/Kernel.php
namespace App;

use Symfony\Component\HttpKernel\Kernel as BaseKernel;
// ...

class Kernel extends BaseKernel
{
    public function getCharset(): string
    {
        return 'ISO-8859-1';
    }
}
```

Example 4 (yaml):
```yaml
# config/services.yaml
parameters:
    # ...
    kernel.container_build_time: '1234567890'
```

---

## Events and Event Listeners

**URL:** https://symfony.com/doc/7.4/event_dispatcher.html

**Contents:**
- Events and Event Listeners
- Creating an Event Listener
  - Defining Event Listeners with PHP Attributes
- Creating an Event Subscriber
- Request Events, Checking Types
- Listeners or Subscribers
- Event Aliases
- Debugging Event Listeners
- How to Set Up Before and After Filters
  - Token Validation Example

During the execution of a Symfony application, lots of event notifications are triggered. Your application can listen to these notifications and respond to them by executing any piece of code.

Symfony triggers several events related to the kernel while processing the HTTP Request. Third-party bundles may also dispatch events, and you can even dispatch custom events from your own code.

All the examples shown in this article use the same KernelEvents::EXCEPTION event for consistency purposes. In your own application, you can use any event and even mix several of them in the same subscriber.

The most common way to listen to an event is to register an event listener:

Now that the class is created, you need to register it as a service and notify Symfony that it is an event listener by using a special "tag":

Symfony follows this logic to decide which method to call inside the event listener class:

There is an optional attribute for the kernel.event_listener tag called priority, which is a positive or negative integer that defaults to 0 and it controls the order in which listeners are executed (the higher the number, the earlier a listener is executed). This is useful when you need to guarantee that one listener is executed before another. The priorities of the internal Symfony listeners usually range from -256 to 256 but your own listeners can use any positive or negative integer.

There is an optional attribute for the kernel.event_listener tag called event which is useful when listener $event argument is not typed. If you configure it, it will change type of $event object. For the kernel.exception event, it is ExceptionEvent. Check out the Symfony events reference to see what type of object each event provides.

With this attribute, Symfony follows this logic to decide which method to call inside the event listener class:

An alternative way to define an event listener is to use the AsEventListener PHP attribute. This allows you to configure the listener inside its class, without having to add any configuration in external files:

You can add multiple #[AsEventListener] attributes to configure different methods. The method property is optional, and when not defined, it defaults to on + uppercased event name. In the example below, the 'foo' event listener doesn't explicitly define its method, so the onFoo() method will be called:

AsEventListener can also be applied to methods directly:

Note that the attribute doesn't require its event parameter to be set if the method already type-hints the expected event.

Support for union types in the $event argument of methods using the #[AsEventListener] attribute was introduced in Symfony 7.4.

Another way to listen to events is via an event subscriber, which is a class that defines one or more methods that listen to one or various events. The main difference with the event listeners is that subscribers always know the events to which they are listening.

If different event subscriber methods listen to the same event, their order is defined by the priority parameter. This value is a positive or negative integer which defaults to 0. The higher the number, the earlier the method is called. Priority is aggregated for all listeners and subscribers, so your methods could be called before or after the methods defined in other listeners and subscribers. To learn more about event subscribers, read The EventDispatcher Component.

The following example shows an event subscriber that defines several methods which listen to the same kernel.exception event via its ExceptionEvent class:

That's it! Your services.yaml file should already be setup to load services from the EventSubscriber directory. Symfony takes care of the rest.

If your methods are not called when an exception is thrown, double-check that you're loading services from the EventSubscriber directory and have autoconfigure enabled. You can also manually add the kernel.event_subscriber tag.

A single page can make several requests (one main request, and then multiple sub-requests - typically when embedding controllers in templates). For the core Symfony events, you might need to check to see if the event is for a "main" request or a "sub request":

Certain things, like checking information on the real request, may not need to be done on the sub-request listeners.

Listeners and subscribers can be used in the same application indistinctly. The decision to use either of them is usually a matter of personal taste. However, there are some minor advantages for each of them:

When configuring event listeners and subscribers via dependency injection, Symfony's core events can also be referred to by the fully qualified class name (FQCN) of the corresponding event class:

Internally, the event FQCN are treated as aliases for the original event names. Since the mapping already happens when compiling the service container, event listeners and subscribers using FQCN instead of event names will appear under the original event name when inspecting the event dispatcher.

This alias mapping can be extended for custom events by registering the compiler pass AddEventAliasesPass:

The compiler pass will always extend the existing list of aliases. Because of that, it is safe to register multiple instances of the pass with different configurations.

You can find out what listeners are registered in the event dispatcher using the console. To show all events and their listeners, run:

You can get registered listeners for a particular event by specifying its name:

or can get everything which partial matches the event name:

The security system uses an event dispatcher per firewall. Use the --dispatcher option to get the registered listeners for a particular event dispatcher:

It is quite common in web application development to need some logic to be performed right before or directly after your controller actions acting as filters or hooks.

Some web frameworks define methods like preExecute() and postExecute(), but there is no such thing in Symfony. The good news is that there is a much better way to interfere with the Request -> Response process using the EventDispatcher component.

Imagine that you need to develop an API where some controllers are public but some others are restricted to one or some clients. For these private features, you might provide a token to your clients to identify themselves.

So, before executing your controller action, you need to check if the action is restricted or not. If it is restricted, you need to validate the provided token.

Please note that for simplicity in this recipe, tokens will be defined in config and neither database setup nor authentication via the Security component will be used.

First, define some token configuration as parameters:

A kernel.controller (aka KernelEvents::CONTROLLER) listener gets notified on every request, right before the controller is executed. So, first, you need some way to identify if the controller that matches the request needs token validation.

A clean and simple way is to create an empty interface and make the controllers implement it:

A controller that implements this interface looks like this:

Next, you'll need to create an event subscriber, which will hold the logic that you want to be executed before your controllers. If you're not familiar with event subscribers, you can learn more about how to use them:

That's it! Your services.yaml file should already be setup to load services from the EventSubscriber directory. Symfony takes care of the rest. Your TokenSubscriber onKernelController() method will be executed on each request. If the controller that is about to be executed implements TokenAuthenticatedController, token authentication is applied. This lets you have a "before" filter on any controller you want.

If your subscriber is not called on each request, double-check that you're loading services from the EventSubscriber directory and have autoconfigure enabled. You can also manually add the kernel.event_subscriber tag.

In addition to having a "hook" that's executed before your controller, you can also add a hook that's executed after your controller. For this example, imagine that you want to add a sha1 hash (with a salt using that token) to all responses that have passed this token authentication.

Another core Symfony event - called kernel.response (aka KernelEvents::RESPONSE) - is notified on every request, but after the controller returns a Response object. To create an "after" listener, create a listener class and register it as a service on this event.

For example, take the TokenSubscriber from the previous example and first record the authentication token inside the request attributes. This will serve as a basic flag that this request underwent token authentication:

Now, configure the subscriber to listen to another event and add onKernelResponse(). This will look for the auth_token flag on the request object and set a custom header on the response if it's found:

That's it! The TokenSubscriber is now notified before every controller is executed (onKernelController()) and after every controller returns a response (onKernelResponse()). By making specific controllers implement the TokenAuthenticatedController interface, your listener knows which controllers it should take action on. And by storing a value in the request's "attributes" bag, the onKernelResponse() method knows to add the extra header. Have fun!

If you want to do something right before, or directly after a method is called, you can dispatch an event respectively at the beginning or at the end of the method:

In this example, two events are dispatched:

Each uses a custom Event class to communicate information to the listeners of the two events. For example, BeforeSendMailEvent might look like this:

And the AfterSendMailEvent even like this:

Both events allow you to get some information (e.g. getMessage()) and even change that information (e.g. setMessage()).

Now, you can create an event subscriber to hook into this event. For example, you could listen to the mailer.post_send event and change the method's return value:

That's it! Your subscriber should be called automatically (or read more about event subscriber configuration).

Code consumes server resources. Blackfire tells you how

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):
```php
// src/EventListener/ExceptionListener.php
namespace App\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        // You get the exception object from the received event
        $exception = $event->getThrowable();
        $message = sprintf(
            'My Error says: %s with code: %s',
            $exception->getMessage(),
            $exception->getCode()
        );

        // Customize your response object to display the exception details
        $response = new Response();
        $response->setContent($message);
        // the exception message can contain unfiltered user input;
        // set the content-type to text to avoid XSS issues
        $response->headers->set('Content-Type', 'text/plain; charset=utf-8');

        // HttpExceptionInterface is a special type of exception that
        // holds status code and header details
        if ($exception instanceof HttpExceptionInterface) {
            $response->setStatusCode($exception->getStatusCode());
            $response->headers->replace($exception->getHeaders());
        } else {
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // sends the modified response object to the event
        $event->setResponse($response);
    }
}
```

Example 2 (yaml):
```yaml
# config/services.yaml
services:
    App\EventListener\ExceptionListener:
        tags: [kernel.event_listener]
```

Example 3 (xml):
```xml
<!-- config/services.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="App\EventListener\ExceptionListener">
            <tag name="kernel.event_listener"/>
        </service>
    </services>
</container>
```

Example 4 (php):
```php
// config/services.php
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

use App\EventListener\ExceptionListener;

return function(ContainerConfigurator $container): void {
    $services = $container->services();

    $services->set(ExceptionListener::class)
        ->tag('kernel.event_listener')
    ;
};
```

---

## The Contracts Component

**URL:** https://symfony.com/doc/7.4/components/contracts.html

**Contents:**
- The Contracts Component
- Installation
- Usage
- Design Principles
- Frequently Asked Questions
  - How Is this Different From PHP-FIG's PSRs?

The Contracts component provides a set of abstractions extracted out of the Symfony components. They can be used to build on semantics that the Symfony components proved useful - and that already have battle-tested implementations.

Contracts are provided as separate packages, so you can install only the ones your projects really need:

If you install this component outside of a Symfony application, you must require the vendor/autoload.php file in your code to enable the class autoloading mechanism provided by Composer. Read this article for more details.

The abstractions in this package are useful to achieve loose coupling and interoperability. By using the provided interfaces as type hints, you are able to reuse any implementations that match their contracts. It could be a Symfony component, or another package provided by the PHP community at large.

Depending on their semantics, some interfaces can be combined with autowiring to seamlessly inject a service in your classes.

Others might be useful as labeling interfaces, to hint about a specific behavior that can be enabled when using autoconfiguration or manual service tagging (or any other means provided by your framework.)

Packages that implement specific contracts should list them in the provide section of their composer.json file, using the symfony/*-implementation convention. For example:

When applicable, the provided contracts are built on top of PHP-FIG's PSRs. However, PHP-FIG has different goals and different processes. Symfony Contracts focuses on providing abstractions that are useful on their own while still compatible with implementations provided by Symfony.

Online Sylius certification, take it now!

Save your teams and projects before they sink

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/cache-contracts
$ composer require symfony/event-dispatcher-contracts
$ composer require symfony/deprecation-contracts
$ composer require symfony/http-client-contracts
$ composer require symfony/service-contracts
$ composer require symfony/translation-contracts
```

Example 2 (json):
```json
{
    "...": "...",
    "provide": {
        "symfony/cache-implementation": "3.0"
    }
}
```

---

## The Bundle System

**URL:** https://symfony.com/doc/7.4/bundles.html

**Contents:**
- The Bundle System
- Creating a Bundle
- Bundle Directory Structure
- Developing a Reusable Bundle
  - Using a Local Path Repository
  - Linking an Already Published Bundle
- Learn more

In Symfony versions prior to 4.0, it was recommended to organize your own application code using bundles. This is no longer recommended and bundles should only be used to share code and features between multiple applications.

Do you prefer video tutorials? Check out the Symfony Bundle Development screencast series.

A bundle is similar to a plugin in other software, but even better. The core features of Symfony framework are implemented with bundles (FrameworkBundle, SecurityBundle, DebugBundle, etc.) Bundles are also used to add new features in your application via third-party bundles.

Bundles used in your applications must be enabled per environment in the config/bundles.php file:

In a default Symfony application that uses Symfony Flex, bundles are enabled/disabled automatically for you when installing/removing them, so you don't need to look at or edit this bundles.php file.

This section creates and enables a new bundle to show that only a few steps are required. The new bundle is called AcmeBlogBundle, where the Acme portion is an example name that should be replaced by some "vendor" name that represents you or your organization (e.g. AbcBlogBundle for some company named Abc).

Start by creating a new class called AcmeBlogBundle:

If your bundle must be compatible with previous Symfony versions you have to extend from the Bundle instead.

The name AcmeBlogBundle follows the standard Bundle naming conventions. You could also choose to shorten the name of the bundle to simply BlogBundle by naming this class BlogBundle (and naming the file BlogBundle.php).

This empty class is the only piece you need to create the new bundle. Though commonly empty, this class is powerful and can be used to customize the behavior of the bundle. Now that you've created the bundle, enable it:

And while it doesn't do anything yet, AcmeBlogBundle is now ready to be used.

The directory structure of a bundle is meant to help to keep code consistent between all Symfony bundles. It follows a set of conventions, but is flexible to be adjusted if needed:

It's recommended to use the PSR-4 autoload standard on your bundle's composer.json file. Use the namespace as key, and the location of the bundle's main class (relative to composer.json) as value. As the main class is located in the src/ directory of the bundle:

Bundles are meant to be reusable pieces of code that live independently from any particular Symfony application. However, a bundle cannot run on its own: it must be registered inside an application to execute its code.

This can be a bit challenging during development. When working on a bundle in its own repository, there's no Symfony application around it, so you need a way to test your changes inside a real application environment.

There are two common approaches to do this, depending on whether your bundle has already been published or is still under development.

If your bundle hasn't been published yet (for example, it's not available on Packagist), you can point Composer to your local bundle directory from any Symfony application you use for testing.

Edit the composer.json file of your application and add this:

Then, in your application, install the bundle as usual:

Composer will create a symbolic link (symlink) to your local bundle directory, so any change you make in the AcmeBlogBundle/ directory is immediately visible in the application. You can now enable the bundle in config/bundles.php:

This setup is ideal during early development because it allows quick iteration without publishing or rebuilding archives.

If your bundle is already public (for example, it's published on Packagist), you can still develop it locally while testing it inside a Symfony application.

In your application, replace the installed bundle with a symlink to your local development copy. For example, if your bundle is installed under vendor/acme/blog-bundle/ and your local copy is in ~/Projects/AcmeBlogBundle/:

Symfony will now use your local bundle directly. You can edit its code, run tests, and see the changes immediately. When you're done, restore the vendor folder or reinstall the package with Composer to go back to the published version.

Online exam, become Symfony certified today

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (typescript):
```typescript
// config/bundles.php
return [
    // 'all' means that the bundle is enabled for any Symfony environment
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    // ...

    // this bundle is enabled only in 'dev'
    Symfony\Bundle\DebugBundle\DebugBundle::class => ['dev' => true],
    // ...

    // this bundle is enabled only in 'dev' and 'test', so you can't use it in 'prod'
    Symfony\Bundle\WebProfilerBundle\WebProfilerBundle::class => ['dev' => true, 'test' => true],
    // ...
];
```

Example 2 (php):
```php
// src/AcmeBlogBundle.php
namespace Acme\BlogBundle;

use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

class AcmeBlogBundle extends AbstractBundle
{
}
```

Example 3 (typescript):
```typescript
// config/bundles.php
return [
    // ...
    Acme\BlogBundle\AcmeBlogBundle::class => ['all' => true],
];
```

Example 4 (json):
```json
{
    "autoload": {
        "psr-4": {
            "Acme\\BlogBundle\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Acme\\BlogBundle\\Tests\\": "tests/"
        }
    }
}
```

---

## Upgrading a Third-Party Bundle for a Major Symfony Version

**URL:** https://symfony.com/doc/7.4/setup/bundles.html

**Contents:**
- Upgrading a Third-Party Bundle for a Major Symfony Version
- Allowing to Install New Symfony Components
- Look for Deprecations and Fix Them
  - Fixing Deprecations
- Testing your Bundle in Symfony Applications
  - Updating the GitHub CI Configuration

According to the Symfony releases plan, Symfony publishes a new major version every two years. Your third-party bundle can support more than one major version (e.g. 5.x and 6.x), but you must apply some techniques to do so, as explained in this article.

Consider a bundle that requires three Symfony components, locked to version 5.4:

When Symfony releases a new major version (e.g. 6.4) and an application uses it, your bundle will no longer be installable in that application. The first step is to allow that new major version in your bundle:

After making the changes shown above, your bundle becomes installable in applications using the new major version. However, it may still fail at runtime. This happens because Symfony deprecates features in minor versions and removes them in the next major version. If your code uses deprecated features, it will break once those features are removed.

You can detect deprecations in two ways:

Fix the reported deprecations, rerun the test suite, and repeat the process until no deprecations remain.

Sometimes fixing a deprecation simply means using the new API instead of the deprecated one. However, in some cases, major Symfony versions introduce larger API changes that require conditional logic.

Avoid relying on the Symfony Kernel version for compatibility checks, as it doesn't reflect the version of individual components and leads to fragile, hard-to-maintain code:

Instead, use feature-based checks, which are more accurate, robust, and forward-compatible. For example, if a new method was added to a component in a given version, check for that feature rather than the kernel version:

Symfony 7.4 deprecated the XML configuration format, which was the recommended format for bundles in previous versions. Consider using the gromnan/symfony-config-xml-to-php tool to automatically convert XML configuration files to PHP.

Before publishing the new version of your bundle, test it locally in a Symfony application. You have two options:

Create a symbolic link from your bundle directory to the corresponding location inside the application's vendor/ directory:

In addition to local tests, it's recommended to configure continuous integration to test your bundle against multiple Symfony versions. Use the following example as a starting point for your own GitHub CI configuration:

Symfony Code Performance Profiling

Become certified from home

**Examples:**

Example 1 (json):
```json
{
    "require": {
        "symfony/framework-bundle": "^5.4",
        "symfony/finder": "^5.4",
        "symfony/validator": "^5.4"
    }
}
```

Example 2 (json):
```json
{
    "require": {
        "symfony/framework-bundle": "^5.4|^6.4",
        "symfony/finder": "^5.4|^6.4",
        "symfony/validator": "^5.4|^6.4"
    }
}
```

Example 3 (julia):
```julia
// ❌ don't do this - resulting code is fragile
if (Kernel::VERSION_ID <= 50400) {
    // code for Symfony 5.x
} else {
    // code for Symfony 6.x
}
```

Example 4 (php):
```php
use Symfony\Component\OptionsResolver\OptionsResolver;

// ✅ this approach is stable across major versions
if (!method_exists(OptionsResolver::class, 'setDefined')) {
    // code for the old OptionsResolver API
} else {
    // code for the new OptionsResolver API
}
```

---

## How to Override any Part of a Bundle

**URL:** https://symfony.com/doc/7.4/bundles/override.html

**Contents:**
- How to Override any Part of a Bundle
- Templates
- Routing
- Controllers
- Services & Configuration
- Entities & Entity Mapping
- Forms
- Validation Metadata
- Translations

When using a third-party bundle, you might want to customize or override some of its features. This document describes ways of overriding the most common features of a bundle.

Third-party bundle templates can be overridden in the <your-project>/templates/bundles/<bundle-name>/ directory. The new templates must use the same name and path (relative to <bundle>/templates/) as the original templates.

For example, to override the templates/registration/confirmed.html.twig template from the AcmeUserBundle, create this template: <your-project>/templates/bundles/AcmeUserBundle/registration/confirmed.html.twig

If you add a template in a new location, you may need to clear your cache (php bin/console cache:clear), even if you are in debug mode.

Instead of overriding an entire template, you may just want to override one or more blocks. However, since you are overriding the template you want to extend from, you would end up in an infinite loop error. The solution is to use the special ! prefix in the template name to tell Symfony that you want to extend from the original template, not from the overridden one:

Symfony internals use some bundles too, so you can apply the same technique to override the core Symfony templates. For example, you can customize error pages overriding TwigBundle templates.

Routing is never automatically imported in Symfony. If you want to include the routes from any bundle, then they must be manually imported from somewhere in your application (e.g. config/routes.yaml).

The easiest way to "override" a bundle's routing is to never import it at all. Instead of importing a third-party bundle's routing, copy that routing file into your application, modify according to your needs, and import your copy instead.

If the controller is a service, see the next section on how to override it. Otherwise, define a new route + controller with the same path associated to the controller you want to override (and make sure that the new route is loaded before the bundle one).

If you want to modify the services created by a bundle, you can use service decoration.

If you want to do more advanced manipulations, like removing services created by other bundles, you must work with service definitions inside a compiler pass.

Overriding entity mapping is only possible if a bundle provides a mapped superclass (such as the User entity in the FOSUserBundle). It's possible to override attributes and associations in this way. Learn more about this feature and its limitations in the Doctrine documentation.

Existing form types can be modified defining form type extensions.

Symfony loads all validation configuration files from every bundle and combines them into one validation metadata tree. This means you are able to add new constraints to a property, but you cannot override them.

To overcome this, the 3rd party bundle needs to have configuration for validation groups. For instance, the FOSUserBundle has this configuration. To create your own validation, add the constraints to a new validation group:

Now, update the FOSUserBundle configuration, so it uses your validation groups instead of the original ones.

Translations are not related to bundles, but to translation domains. For this reason, you can override any bundle translation file from the main translations/ directory, as long as the new file uses the same domain.

For example, to override the translations defined in the translations/AcmeUserBundle.es.yaml file of the AcmeUserBundle, create a <your-project>/translations/AcmeUserBundle.es.yaml file.

Symfony Code Performance Profiling

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (sql):
```sql
{# templates/bundles/AcmeUserBundle/registration/confirmed.html.twig #}
{# the special '!' prefix avoids errors when extending from an overridden template #}
{% extends "@!AcmeUser/registration/confirmed.html.twig" %}

{% block some_block %}
    ...
{% endblock %}
```

Example 2 (markdown):
```markdown
# config/validator/validation.yaml
FOS\UserBundle\Model\User:
    properties:
        plainPassword:
            - NotBlank:
                groups: [AcmeValidation]
            - Length:
                min: 6
                minMessage: fos_user.password.short
                groups: [AcmeValidation]
```

Example 3 (xml):
```xml
<!-- config/validator/validation.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<constraint-mapping xmlns="http://symfony.com/schema/dic/constraint-mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/constraint-mapping
        https://symfony.com/schema/dic/constraint-mapping/constraint-mapping-1.0.xsd"
>
    <class name="FOS\UserBundle\Model\User">
        <property name="plainPassword">
            <constraint name="NotBlank">
                <option name="groups">
                    <value>AcmeValidation</value>
                </option>
            </constraint>

            <constraint name="Length">
                <option name="min">6</option>
                <option name="minMessage">fos_user.password.short</option>
                <option name="groups">
                    <value>AcmeValidation</value>
                </option>
            </constraint>
        </property>
    </class>
</constraint-mapping>
```

---

## Building your own Framework with the MicroKernelTrait

**URL:** https://symfony.com/doc/7.4/configuration/micro_kernel_trait.html

**Contents:**
- Building your own Framework with the MicroKernelTrait
- A Single-File Symfony Application
- The Methods of a "Micro" Kernel
- Adding Interfaces to "Micro" Kernel
- Advanced Example: Twig, Attributes and the Web Debug Toolbar

The default Kernel class included in Symfony applications uses a MicroKernelTrait to configure the bundles, the routes and the service container in the same class.

This micro-kernel approach is flexible, allowing you to control your application structure and features.

Start with a completely empty directory and install these Symfony components via Composer:

Next, create an index.php file that defines the kernel class and runs it:

That's it! To test it, start the Symfony local web server:

Then see the JSON response in your browser: http://localhost:8000/random/10

If your kernel only defines a single controller, you can use an invokable method:

When you use the MicroKernelTrait, your kernel needs to have exactly three methods that define your bundles, your services and your routes:

This is the same registerBundles() that you see in a normal kernel. By default, the micro kernel only registers the FrameworkBundle. If you need to register more bundles, override this method:

In this method, you can use the RoutingConfigurator object to define routes in your application and associate them to the controllers defined in this very same file.

However, it's more convenient to define the controller routes using PHP attributes, as shown above. That's why this method is commonly used only to load external routing files (e.g. from bundles) as shown below.

When using the MicroKernelTrait, you can also implement the CompilerPassInterface to automatically register the kernel itself as a compiler pass as explained in the dedicated compiler pass section. If the ExtensionInterface is implemented when using the MicroKernelTrait, then the kernel will be automatically registered as an extension. You can learn more about it in the dedicated section about managing configuration with extensions.

It is also possible to implement the EventSubscriberInterface to handle events directly from the kernel, again it will be registered automatically:

The purpose of the MicroKernelTrait is not to have a single-file application. Instead, its goal is to give you the power to choose your bundles and structure.

First, you'll probably want to put your PHP classes in an src/ directory. Configure your composer.json file to load from there:

Then, run composer dump-autoload to dump your new autoload config.

Now, suppose you want to define a custom configuration for your app, use Twig and load routes via attributes. Instead of putting everything in index.php, create a new src/Kernel.php to hold the kernel. Now it looks like this:

The wdt.php and profiler.php files were introduced in Symfony 7.3. Previously, you had to import wdt.xml and profiler.xml

Before continuing, run this command to add support for the new dependencies:

Next, create a new extension class that defines your app configuration and add a service conditionally based on the foo value:

Unlike the previous kernel, this loads an external config/framework.yaml file, because the configuration started to get bigger:

This also loads attribute routes from an src/Controller/ directory, which has one file in it:

Template files should live in the templates/ directory at the root of your project. This template lives at templates/micro/random.html.twig:

Finally, you need a front controller to boot and run the application. Create a public/index.php:

That's it! This /random/10 URL will work, Twig will render, and you'll even get the web debug toolbar to show up at the bottom. The final structure looks like this:

As before you can use the Symfony local web server:

Then visit the page in your browser: http://localhost:8000/random/10

Become certified from home

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/framework-bundle symfony/runtime
```

Example 2 (php):
```php
// index.php
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\Routing\Attribute\Route;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    protected function configureContainer(ContainerConfigurator $container): void
    {
        // PHP equivalent of config/packages/framework.yaml
        $container->extension('framework', [
            'secret' => 'S0ME_SECRET'
        ]);
    }

    #[Route('/random/{limit}', name: 'random_number')]
    public function randomNumber(int $limit): JsonResponse
    {
        return new JsonResponse([
            'number' => random_int(0, $limit),
        ]);
    }
}

return static function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
```

Example 3 (php):
```php
// index.php
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    protected function configureContainer(ContainerConfigurator $container): void
    {
        // PHP equivalent of config/packages/framework.yaml
        $container->extension('framework', [
            'secret' => 'S0ME_SECRET'
        ]);
    }

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->add('random_number', '/random/{limit}')->controller([$this, 'randomNumber']);
    }

    public function randomNumber(int $limit): JsonResponse
    {
        return new JsonResponse([
            'number' => random_int(0, $limit),
        ]);
    }
}

return static function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
```

Example 4 (unknown):
```unknown
$ symfony server:start
```

---

## How to Create Multiple Symfony Applications with a Single Kernel

**URL:** https://symfony.com/doc/7.4/configuration/multiple_kernels.html

**Contents:**
- How to Create Multiple Symfony Applications with a Single Kernel
- Turning a Single Application into Multiple Applications
  - Step 1) Create a new Application
  - Step 2) Update the Kernel class to support Multiple Applications
  - Step 3) Add a new APP_ID environment variable
  - Step 4) Update the Front Controllers
- Executing Commands
- Rendering Templates
- Running Tests
- Adding more Applications

In Symfony applications, incoming requests are usually processed by the front controller at public/index.php, which instantiates the src/Kernel.php class to create the application kernel. This kernel loads the bundles, the configuration, and handles the request to generate the response.

The current implementation of the Kernel class serves as a convenient default for a single application. However, it can also manage multiple applications. While the Kernel typically runs the same application with different configurations based on various environments, it can be adapted to run different applications with specific bundles and configuration.

These are some of the common use cases for creating multiple applications with a single Kernel:

These are the steps required to convert a single application into a new one that supports multiple applications:

The following example shows how to create a new application for the API of a new Symfony project.

This example follows the Shared Kernel pattern: all applications maintain an isolated context, but they can share common bundles, configuration, and code if desired. The optimal approach will depend on your specific needs and requirements, so it's up to you to decide which best suits your project.

First, create a new apps directory at the root of your project, which will hold all the necessary applications. Each application will follow a simplified directory structure like the one described in Symfony Best Practice:

Note that the config/ and src/ directories at the root of the project will represent the shared context among all applications within the apps/ directory. Therefore, you should carefully consider what is common and what should be placed in the specific application.

You might also consider renaming the namespace for the shared context, from App to Shared, as it will make it easier to distinguish and provide clearer meaning to this context.

Since the new apps/api/src/ directory will host the PHP code related to the API, you have to update the composer.json file to include it in the autoload section:

Additionally, don't forget to run composer dump-autoload to generate the autoload files.

Since there will be multiple applications, it's better to add a new property string $id to the Kernel to identify the application being loaded. This property will also allow you to split the cache, logs, and configuration files in order to avoid collisions with other applications. Moreover, it contributes to performance optimization, as each application will load only the required resources:

This example reuses the default implementation to import the configuration and routes based on a given configuration directory. As shown earlier, this approach will import both the shared and the app-specific resources.

Next, define a new environment variable that identifies the current application. This new variable can be added to the .env file to provide a default value, but it should typically be added to your web server configuration.

The value of this variable must match the application directory within apps/ as it is used in the Kernel to load the specific application configuration.

In this final step, update the front controllers public/index.php and bin/console to pass the value of the APP_ID variable to the Kernel instance. This will allow the Kernel to load and run the specified application:

Similar to configuring the required APP_ENV and APP_DEBUG values, the third argument of the Kernel constructor is now also necessary to set the application ID, which is derived from an external configuration.

For the second front controller, define a new console option to allow passing the application ID to run under CLI context:

The bin/console script, which is used to run Symfony commands, always uses the Kernel class to build the application and load the commands. If you need to run console commands for a specific application, you can provide the --id option along with the appropriate identity value:

You might want to update the composer auto-scripts section to run multiple commands simultaneously. This example shows the commands of two different applications called api and admin:

Then, run composer auto-scripts to test it!

The commands available for each console script (e.g. bin/console -iapi and bin/console -iadmin) can differ because they depend on the bundles enabled for each application, which could be different.

Let's consider that you need to create another app called admin. If you follow the Symfony Best Practices, the shared Kernel templates will be located in the templates/ directory at the project's root. For admin-specific templates, you can create a new directory apps/admin/templates/ which you will need to manually configure under the Admin application:

Then, use this Twig namespace to reference any template within the Admin application only, for example @Admin/form/fields.html.twig.

In Symfony applications, functional tests typically extend from the WebTestCase class by default. Within its parent class, KernelTestCase, there is a method called createKernel() that attempts to create the kernel responsible for running the application during tests. However, the current logic of this method doesn't include the new application ID argument, so you need to update it:

This examples uses a hardcoded application ID value because the tests extending this ApiTestCase class will focus solely on the api tests.

Now, create a tests/ directory inside the apps/api/ application. Then, update both the composer.json file and phpunit.xml configuration about its existence:

Remember to run composer dump-autoload to generate the autoload files.

And, here is the update needed for the phpunit.xml file:

Now you can begin adding more applications as needed, such as an admin application to manage the project's configuration and permissions. To do that, you will have to repeat the step 1 only:

Additionally, you might need to update your web server configuration to set the APP_ID=admin under a different domain.

Measure & Improve Symfony Code Performance

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
your-project/
├─ apps/
│  └─ api/
│     ├─ config/
│     │  ├─ bundles.php
│     │  ├─ routes.yaml
│     │  └─ services.yaml
│     └─ src/
├─ bin/
│  └─ console
├─ config/
├─ public/
│  └─ index.php
├─ src/
│  └─ Kernel.php
```

Example 2 (json):
```json
{
    "autoload": {
        "psr-4": {
            "Shared\\": "src/",
            "Api\\": "apps/api/src/"
        }
    }
}
```

Example 3 (php):
```php
// src/Kernel.php
namespace Shared;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

class Kernel extends BaseKernel
{
    use MicroKernelTrait { getConfigDir as getSharedConfigDir; }

    public function __construct(string $environment, bool $debug, private string $id)
    {
        parent::__construct($environment, $debug);
    }

    public function getAppConfigDir(): string
    {
        return $this->getProjectDir().'/apps/'.$this->id.'/config';
    }

    public function registerBundles(): iterable
    {
        $sharedBundles = require $this->getSharedConfigDir().'/bundles.php';
        $appBundles = require $this->getAppConfigDir().'/bundles.php';

        // load common bundles, such as the FrameworkBundle, as well as
        // specific bundles required exclusively for the app itself
        foreach (array_merge($sharedBundles, $appBundles) as $class => $envs) {
            if ($envs[$this->environment] ?? $envs['all'] ?? false) {
                yield new $class();
            }
        }
    }

    public function getCacheDir(): string
    {
        // divide cache for each application
        return ($_SERVER['APP_CACHE_DIR'] ?? $this->getProjectDir().'/var/cache').'/'.$this->id.'/'.$this->environment;
    }

    public function getLogDir(): string
    {
        // divide logs for each application
        return ($_SERVER['APP_LOG_DIR'] ?? $this->getProjectDir().'/var/log').'/'.$this->id;
    }

    protected function configureContainer(ContainerConfigurator $container): void
    {
        // load common config files, such as the framework.yaml, as well as
        // specific configs required exclusively for the app itself
        $this->doConfigureContainer($container, $this->getSharedConfigDir());
        $this->doConfigureContainer($container, $this->getAppConfigDir());
    }

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        // load common routes files, such as the routes/framework.yaml, as well as
        // specific routes required exclusively for the app itself
        $this->doConfigureRoutes($routes, $this->getSharedConfigDir());
        $this->doConfigureRoutes($routes, $this->getAppConfigDir());
    }

    private function doConfigureContainer(ContainerConfigurator $container, string $configDir): void
    {
        $container->import($configDir.'/{packages}/*.{php,yaml}');
        $container->import($configDir.'/{packages}/'.$this->environment.'/*.{php,yaml}');

        if (is_file($configDir.'/services.yaml')) {
            $container->import($configDir.'/services.yaml');
            $container->import($configDir.'/{services}_'.$this->environment.'.yaml');
        } else {
            $container->import($configDir.'/{services}.php');
        }
    }

    private function doConfigureRoutes(RoutingConfigurator $routes, string $configDir): void
    {
        $routes->import($configDir.'/{routes}/'.$this->environment.'/*.{php,yaml}');
        $routes->import($configDir.'/{routes}/*.{php,yaml}');

        if (is_file($configDir.'/routes.yaml')) {
            $routes->import($configDir.'/routes.yaml');
        } else {
            $routes->import($configDir.'/{routes}.php');
        }

        if (false !== ($fileName = (new \ReflectionObject($this))->getFileName())) {
            $routes->import($fileName, 'attribute');
        }
    }
}
```

Example 4 (markdown):
```markdown
# .env
APP_ID=api
```

---

## Built-in Symfony Events

**URL:** https://symfony.com/doc/7.4/reference/events.html

**Contents:**
- Built-in Symfony Events
- Kernel Events
  - kernel.request
  - kernel.controller
  - kernel.controller_arguments
  - kernel.view
  - kernel.response
  - kernel.finish_request
  - kernel.terminate
  - kernel.exception

The Symfony framework is an HTTP Request-Response one. During the handling of an HTTP request, the framework (or any application using the HttpKernel component) dispatches some events which you can use to modify how the request is handled and how the response is returned.

Each event dispatched by the HttpKernel component is a subclass of KernelEvent, which provides the following information:

Event Class: RequestEvent

This event is dispatched very early in Symfony, before the controller is determined. It's useful to add information to the Request or return a Response early to stop the handling of the request.

Read more on the kernel.request event.

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: ControllerEvent

This event is dispatched after the controller has been resolved but before executing it. It's useful to initialize things later needed by the controller, such as value resolvers, and even to change the controller entirely:

Read more on the kernel.controller event.

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: ControllerArgumentsEvent

This event is dispatched just before a controller is called. It's useful to configure the arguments that are going to be passed to the controller. Typically, this is used to map URL routing parameters to their corresponding named arguments; or pass the current request when the Request type-hint is found:

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: ViewEvent

This event is dispatched after the controller has been executed but only if the controller does not return a Response object. It's useful to transform the returned value (e.g. a string with some HTML contents) into the Response object needed by Symfony:

Read more on the kernel.view event.

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: ResponseEvent

This event is dispatched after the controller or any kernel.view listener returns a Response object. It's useful to modify or replace the response before sending it back (e.g. add/modify HTTP headers, add cookies, etc.):

Read more on the kernel.response event.

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: FinishRequestEvent

This event is dispatched after the kernel.response event. It's useful to reset the global state of the application (for example, the translator listener resets the translator's locale to the one of the parent request):

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: TerminateEvent

This event is dispatched after the response has been sent (after the execution of the handle() method). It's useful to perform slow or complex tasks that don't need to be completed to send the response (e.g. sending emails).

Read more on the kernel.terminate event.

Execute this command to find out which listeners are registered for this event and their priorities:

Event Class: ExceptionEvent

This event is dispatched as soon as an error occurs during the handling of the HTTP request. It's useful to recover from errors or modify the exception details sent as response:

The TwigBundle registers an ErrorListener that forwards the Request to a given controller defined by the exception_listener.controller parameter.

Symfony uses the following logic to determine the HTTP status code of the response:

If you want to overwrite the status code of the exception response, which you should not without a good reason, call ExceptionEvent::allowCustomResponseCode() first and then set the status code on the response:

The status code sent to the client in the above example will be 204. If $event->allowCustomResponseCode() is omitted, then the kernel will set an appropriate status code based on the type of exception thrown.

Read more on the kernel.exception event.

Execute this command to find out which listeners are registered for this event and their priorities:

Check Code Performance in Dev, Test, Staging & Production

Put the code quality back at the heart of your project

**Examples:**

Example 1 (unknown):
```unknown
$ php bin/console debug:event-dispatcher kernel.request
```

Example 2 (php):
```php
use Symfony\Component\HttpKernel\Event\ControllerEvent;

public function onKernelController(ControllerEvent $event): void
{
    // ...

    // the controller can be changed to any PHP callable
    $event->setController($myCustomController);
}
```

Example 3 (unknown):
```unknown
$ php bin/console debug:event-dispatcher kernel.controller
```

Example 4 (php):
```php
use Symfony\Component\HttpKernel\Event\ControllerArgumentsEvent;

public function onKernelControllerArguments(ControllerArgumentsEvent $event): void
{
    // ...

    // get controller and request arguments
    $namedArguments = $event->getRequest()->attributes->all();
    $controllerArguments = $event->getArguments();

    // set the controller arguments to modify the original arguments or add new ones
    $event->setArguments($newArguments);
}
```

---

## How to Load Service Configuration inside a Bundle

**URL:** https://symfony.com/doc/7.4/bundles/extension.html

**Contents:**
- How to Load Service Configuration inside a Bundle
- Loading Services Directly in your Bundle Class
- Creating an Extension Class
  - Manually Registering an Extension Class
  - Using the load() Method
  - Using Configuration to Change the Services
- Adding Classes to Compile

Services created by bundles are not defined in the main config/services.yaml file used by the application but in the bundles themselves. This article explains how to create and load service files using the bundle directory structure.

There are two different ways of doing it:

In bundles extending the AbstractBundle class, you can define the loadExtension() method to load service definitions from configuration files:

This method works similar to the Extension::load() method explained below, but it uses a new simpler API to define and import service configuration.

Contrary to the $configs parameter in Extension::load(), the $config parameter is already merged and processed by the AbstractBundle.

The loadExtension() is called only at compile time.

This is the traditional way of loading service definitions in bundles. For new bundles it's recommended to load your services in the main bundle class, but the traditional way of creating an extension class still works.

A dependency injection extension is defined as a class that follows these conventions (later you'll learn how to skip them if needed):

This is how the extension of an AcmeHelloBundle should look like:

When not following the conventions, you will have to manually register your extension. To do this, you should override the Bundle::getContainerExtension() method to return the instance of the extension:

In addition, when the new Extension class name doesn't follow the naming conventions, you must also override the Extension::getAlias() method to return the correct DI alias. The DI alias is the name used to refer to the bundle in the container (e.g. in the config/packages/ files). By default, this is done by removing the Extension suffix and converting the class name to underscores (e.g. AcmeHelloExtension's DI alias is acme_hello).

In the load() method, all services and parameters related to this extension will be loaded. This method doesn't get the actual container instance, but a copy. This container only has the parameters from the actual container. After loading the services and parameters, the copy will be merged into the actual container, to ensure all services and parameters are also added to the actual container.

In the load() method, you can use PHP code to register service definitions, but it is more common if you put these definitions in a configuration file (using the YAML, XML or PHP format).

For instance, assume you have a file called services.xml in the config/ directory of your bundle, your load() method looks like:

The other available loaders are YamlFileLoader and PhpFileLoader.

The Extension is also the class that handles the configuration for that particular bundle (e.g. the configuration in config/packages/<bundle_alias>.yaml). To read more about it, see the "How to Create Friendly Configuration for a Bundle" article.

Bundles can hint Symfony about which of their classes contain annotations so they are compiled when generating the application cache to improve the overall performance. Define the list of annotated classes to compile in the addAnnotatedClassesToCompile() method:

If some class extends from other classes, all its parents are automatically included in the list of classes to compile.

Patterns are transformed into the actual class namespaces using the classmap generated by Composer. Therefore, before using these patterns, you must generate the full classmap executing the dump-autoload command of Composer.

This technique can't be used when the classes to compile use the __DIR__ or __FILE__ constants, because their values will change when loading these classes from the classes.php file.

The addAnnotatedClassesToCompile() method was deprecated in Symfony 7.1 and will be removed in Symfony 8.0. No alternative is provided because the technique explained in this section is no longer necessary with modern PHP.

Get your Sylius expertise recognized

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):
```php
// ...
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

class AcmeHelloBundle extends AbstractBundle
{
    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        // load an XML, PHP or YAML file
        $container->import('../config/services.xml');

        // you can also add or replace parameters and services
        $container->parameters()
            ->set('acme_hello.phrase', $config['phrase'])
        ;

        if ($config['scream']) {
            $container->services()
                ->get('acme_hello.printer')
                    ->class(ScreamingPrinter::class)
            ;
        }
    }
}
```

Example 2 (php):
```php
// src/DependencyInjection/AcmeHelloExtension.php
namespace Acme\HelloBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;

class AcmeHelloExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        // ... you'll load the files here later
    }
}
```

Example 3 (php):
```php
// ...
use Acme\HelloBundle\DependencyInjection\UnconventionalExtensionClass;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;

class AcmeHelloBundle extends Bundle
{
    public function getContainerExtension(): ?ExtensionInterface
    {
        return new UnconventionalExtensionClass();
    }
}
```

Example 4 (php):
```php
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;

// ...
public function load(array $configs, ContainerBuilder $container): void
{
    $loader = new XmlFileLoader(
        $container,
        new FileLocator(__DIR__.'/../../config')
    );
    $loader->load('services.xml');
}
```

---

## Best Practices for Reusable Bundles

**URL:** https://symfony.com/doc/7.4/bundles/best_practices.html

**Contents:**
- Best Practices for Reusable Bundles
- Bundle Name
- Directory Structure
- Classes
- Vendors
- Doctrine Entities/Documents
- Tests
- Continuous Integration
  - Require a Specific Symfony Version
- Installation

This article is all about how to structure your reusable bundles to be configurable and extendable. Reusable bundles are those meant to be shared privately across many company projects or publicly so any Symfony project can install them.

A bundle is also a PHP namespace. The namespace must follow the PSR-4 interoperability standard for PHP namespaces and class names: it starts with a vendor segment, followed by zero or more category segments, and it ends with the namespace short name, which must end with Bundle.

A namespace becomes a bundle as soon as you add "a bundle class" to it (which is a class that extends Bundle). The bundle class name must follow these rules:

Here are some valid bundle namespaces and class names:

By convention, the getName() method of the bundle class should return the class name.

If you share your bundle publicly, you must use the bundle class name as the name of the repository (AcmeBlogBundle and not BlogBundle for instance).

Symfony core Bundles do not prefix the Bundle class with Symfony and always add a Bundle sub-namespace; for example: FrameworkBundle.

Each bundle has an alias, which is the lower-cased short version of the bundle name using underscores (acme_blog for AcmeBlogBundle). This alias is used to enforce uniqueness within a project and for defining bundle's configuration options (see below for some usage examples).

The following is the recommended directory structure of an AcmeBlogBundle:

This directory structure is used by default when your bundle class extends the recommended AbstractBundle. If your bundle extends the Bundle class, you have to override the getPath() method as follows:

The following files are mandatory, because they ensure a structure convention that automated tools can rely on:

The depth of subdirectories should be kept to a minimum for the most used classes and files. Two levels is the maximum.

The bundle directory is read-only. If you need to write temporary files, store them under the cache/ or log/ directory of the host application. Tools can generate files in the bundle directory structure, but only if the generated files are going to be part of the repository.

The following classes and files have specific emplacements (some are mandatory and others are just conventions followed by most developers):

The bundle directory structure is used as the namespace hierarchy. For instance, a ContentController controller which is stored in src/Controller/ContentController.php would have the fully qualified class name of Acme\BlogBundle\Controller\ContentController.

All classes and files must follow the Symfony coding standards.

Some classes should be seen as facades and should be as short as possible, like Commands, Helpers, Listeners and Controllers.

Classes that connect to the event dispatcher should be suffixed with Listener.

Exception classes should be stored in an Exception sub-namespace.

A bundle must not embed third-party PHP libraries. It should rely on the standard Symfony autoloading instead.

A bundle should also not embed third-party libraries written in JavaScript, CSS or any other language.

If the bundle includes Doctrine ORM entities and/or ODM documents, it's recommended to define their mapping using XML files stored in config/doctrine/. This allows you to override that mapping using the standard Symfony mechanism to override bundle parts. This is not possible when using attributes to define the mapping.

A bundle should come with a test suite written with PHPUnit and stored under the tests/ directory. Tests should follow the following principles:

A test suite must not contain AllTests.php scripts, but must rely on the existence of a phpunit.dist.xml file.

Testing bundle code continuously, including all its commits and pull requests, is a good practice called Continuous Integration. There are several services providing this feature for free for open source projects, like GitHub Actions.

A bundle should at least test:

Therefore, a bundle supporting PHP 7.4, 8.3 and 8.4, and Symfony 6.4 and 7.x should have at least this test matrix:

The tests should be run with the SYMFONY_DEPRECATIONS_HELPER env variable set to max[direct]=0. This ensures no code in the bundle uses deprecated features directly.

The lowest dependency tests can be run with this variable set to disabled=1.

You can use the special SYMFONY_REQUIRE environment variable together with Symfony Flex to install a specific Symfony version:

If you want to cache your Composer dependencies, do not cache the vendor/ directory as this has side-effects. Instead cache $HOME/.composer/cache/files.

Bundles should set "type": "symfony-bundle" in their composer.json file. With this, Symfony Flex will be able to automatically enable your bundle when it's installed.

If your bundle requires any setup (e.g. configuration, new files, changes to .gitignore, etc), then you should create a Symfony Flex recipe.

All classes and functions must come with full PHPDoc.

Extensive documentation should also be provided in the docs/ directory. The index file (for example docs/index.rst or docs/index.md) is the only mandatory file and must be the entry point for the documentation. The reStructuredText (rST) is the format used to render the documentation on the Symfony website.

In order to ease the installation of third-party bundles, consider using the following standardized instructions in your README.md file.

The example above assumes that you are installing the latest stable version of the bundle, where you don't have to provide the package version number (e.g. composer require friendsofsymfony/user-bundle). If the installation instructions refer to some past bundle version or to some unstable version, include the version constraint (e.g. composer require friendsofsymfony/user-bundle "~2.0@dev").

Optionally, you can add more installation steps (Step 3, Step 4, etc.) to explain other required installation tasks, such as registering routes or dumping assets.

If the bundle provides routes, they must be prefixed with the bundle alias. For example, if your bundle is called AcmeBlogBundle, all its routes must be prefixed with acme_blog_.

If a bundle provides templates, they must use Twig. A bundle must not provide a main layout, except if it provides a full working application.

If a bundle provides message translations, they must be defined in the XLIFF format; the domain should be named after the bundle name (AcmeBlog).

A bundle must not override existing messages from another bundle.

The translation domain must match the translation file names. For example, if the translation domain is AcmeBlog, the English translation file name should be AcmeBlog.en.xlf.

To provide more flexibility, a bundle can provide configurable settings by using the Symfony built-in mechanisms.

For simple configuration settings, rely on the default parameters entry of the Symfony configuration. Symfony parameters are simple key/value pairs; a value being any valid PHP value. Each parameter name should start with the bundle alias, though this is just a best-practice suggestion. The rest of the parameter name will use a period (.) to separate different parts (e.g. acme_blog.author.email).

The end user can provide values in any configuration file:

Retrieve the configuration parameters in your code from the container:

While this mechanism requires the least effort, you should consider using the more advanced semantic bundle configuration to make your configuration more robust.

Bundles must be versioned following the Semantic Versioning Standard.

If the bundle defines services, they must be prefixed with the bundle alias instead of using fully qualified class names like you do in your project services. For example, AcmeBlogBundle services must be prefixed with acme_blog. The reason is that bundles shouldn't rely on features such as service autowiring or autoconfiguration to not impose an overhead when compiling application services.

In addition, services not meant to be used by the application directly, should be defined as private. For public services, aliases should be created from the interface/class to the service id. For example, in MonologBundle, an alias is created from Psr\Log\LoggerInterface to logger so that the LoggerInterface type-hint can be used for autowiring.

Services should not use autowiring or autoconfiguration. Instead, all services should be defined explicitly.

If there is no intention for the service id to be used by the end user, you can mark it as hidden by prefixing it with a dot (e.g. .acme_blog.logger). This prevents the service from being listed in the default debug:container command output.

You can learn much more about service loading in bundles reading this article: How to Load Service Configuration inside a Bundle.

The composer.json file should include at least the following metadata:

This information is used by Symfony to load the classes of the bundle. It's recommended to use the PSR-4 autoload standard: use the namespace as key, and the location of the bundle's main class (relative to composer.json) as value. As the main class is located in the src/ directory of the bundle:

In order to make it easier for developers to find your bundle, register it on Packagist, the official repository for Composer packages.

If the bundle references any resources (config files, translation files, etc.), you can use physical paths (e.g. __DIR__/config/services.xml).

In the past, we recommended to only use logical paths (e.g. @AcmeBlogBundle/config/services.xml) and resolve them with the resource locator provided by the Symfony kernel, but this is no longer a recommended practice.

Check Code Performance in Dev, Test, Staging & Production

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
<your-bundle>/
├── assets/
├── config/
├── docs/
│   └─ index.md
├── public/
├── src/
│   ├── Controller/
│   ├── DependencyInjection/
│   └── AcmeBlogBundle.php
├── templates/
├── tests/
├── translations/
├── LICENSE
└── README.md
```

Example 2 (php):
```php
use Symfony\Component\HttpKernel\Bundle\Bundle;

class AcmeBlogBundle extends Bundle
{
    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
```

Example 3 (sql):
```sql
# this requires Symfony 7.x for all Symfony packages
export SYMFONY_REQUIRE=7.*
# alternatively you can run this command to update composer.json config
# composer config extra.symfony.require "7.*"

# install Symfony Flex in the CI environment
composer global config --no-plugins allow-plugins.symfony/flex true
composer global require --no-progress --no-scripts --no-plugins symfony/flex

# install the dependencies (using --prefer-dist and --no-progress is
# recommended to have a better output and faster download time)
composer update --prefer-dist --no-progress
```

Example 4 (typescript):
```typescript
Installation
============

Make sure Composer is installed globally, as explained in the
[installation chapter](https://getcomposer.org/doc/00-intro.md)
of the Composer documentation.

Applications that use Symfony Flex
----------------------------------

Open a command console, enter your project directory and execute:

```console
composer require <package-name>
```

Applications that don't use Symfony Flex
----------------------------------------

### Step 1: Download the Bundle

Open a command console, enter your project directory and execute the
following command to download the latest stable version of this bundle:

```console
composer require <package-name>
```

### Step 2: Enable the Bundle

Then, enable the bundle by adding it to the list of registered bundles
in the `config/bundles.php` file of your project:

```php
// config/bundles.php

return [
    // ...
    <vendor>\<bundle-name>\<bundle-long-name>::class => ['all' => true],
];
```
```

---

## How to Create Friendly Configuration for a Bundle

**URL:** https://symfony.com/doc/7.4/bundles/configuration.html

**Contents:**
- How to Create Friendly Configuration for a Bundle
- Using the AbstractBundle Class
- Using the Bundle Extension
  - Processing the $configs Array
- Modifying the Configuration of Another Bundle
- Dump the Configuration
- Supporting XML
  - Make your Config Tree ready for XML
  - Choosing an XML Namespace
  - Providing an XML Schema

If you open your main application configuration directory (usually config/packages/), you'll see a number of different files, such as framework.yaml, twig.yaml and doctrine.yaml. Each of these configures a specific bundle, allowing you to define options at a high level and then let the bundle make all the low-level, complex changes based on your settings.

For example, the following configuration tells the FrameworkBundle to enable the form integration, which involves the definition of quite a few services as well as integration of other related components:

There are two different ways of creating friendly configuration for a bundle:

In bundles extending the AbstractBundle class, you can add all the logic related to processing the configuration in that class:

The configure() and loadExtension() methods are called only at compile time.

The AbstractBundle::configure() method also allows importing the configuration definition from one or more files:

This is the traditional way of creating friendly configuration for bundles. For new bundles it's recommended to use the main bundle class, but the traditional way of creating an extension class still works.

Imagine you are creating a new bundle - AcmeSocialBundle - which provides integration with X/Twitter. To make your bundle configurable to the user, you can add some configuration that looks like this:

The basic idea is that instead of having the user override individual parameters, you let the user configure just a few, specifically created, options. As the bundle developer, you then parse through that configuration and load correct services and parameters inside an "Extension" class.

The root key of your bundle configuration (acme_social in the previous example) is automatically determined from your bundle name (it's the snake case of the bundle name without the Bundle suffix).

Read more about the extension in How to Load Service Configuration inside a Bundle.

If a bundle provides an Extension class, then you should not generally override any service container parameters from that bundle. The idea is that if an extension class is present, every setting that should be configurable should be present in the configuration made available by that class. In other words, the extension class defines all the public configuration settings for which backward compatibility will be maintained.

For parameter handling within a dependency injection container see Using Parameters within a Dependency Injection Class.

First things first, you have to create an extension class as explained in How to Load Service Configuration inside a Bundle.

Whenever a user includes the acme_social key (which is the DI alias) in a configuration file, the configuration under it is added to an array of configurations and passed to the load() method of your extension (Symfony automatically converts XML and YAML to an array).

For the configuration example in the previous section, the array passed to your load() method will look like this:

Notice that this is an array of arrays, not just a single flat array of the configuration values. This is intentional, as it allows Symfony to parse several configuration resources. For example, if acme_social appears in another configuration file - say config/packages/dev/acme_social.yaml - with different values beneath it, the incoming array might look like this:

The order of the two arrays depends on which one is set first.

But don't worry! Symfony's Config component will help you merge these values, provide defaults and give the user validation errors on bad configuration. Here's how it works. Create a Configuration class in the DependencyInjection directory and build a tree that defines the structure of your bundle's configuration.

The Configuration class to handle the sample configuration looks like:

The Configuration class can be much more complicated than shown here, supporting "prototype" nodes, advanced validation, XML-specific normalization and advanced merging. You can read more about this in the Config component documentation. You can also see it in action by checking out some core Configuration classes, such as the one from the FrameworkBundle Configuration or the TwigBundle Configuration.

This class can now be used in your load() method to merge configurations and force validation (e.g. if an additional option was passed, an exception will be thrown):

The processConfiguration() method uses the configuration tree you've defined in the Configuration class to validate, normalize and merge all the configuration arrays together.

Now, you can use the $config variable to modify a service provided by your bundle. For example, imagine your bundle has the following example config:

In your extension, you can load this and dynamically set its arguments:

Instead of calling processConfiguration() in your extension each time you provide some configuration options, you might want to use the ConfigurableExtension to do this automatically for you:

This class uses the getConfiguration() method to get the Configuration instance.

Processing the Configuration yourself

Using the Config component is fully optional. The load() method gets an array of configuration values. You can instead parse these arrays yourself (e.g. by overriding configurations and using isset to check for the existence of a value). Be aware that it'll be very hard to support XML:

If you have multiple bundles that depend on each other, it may be useful to allow one Extension class to modify the configuration passed to another bundle's Extension class. This can be achieved using a prepend extension. For more details, see How to Simplify Configuration of Multiple Bundles.

The config:dump-reference command dumps the default configuration of a bundle in the console using the Yaml format.

As long as your bundle's configuration is located in the standard location (<YourBundle>/src/DependencyInjection/Configuration) and does not have a constructor, it will work automatically. If you have something different, your Extension class must override the Extension::getConfiguration() method and return an instance of your Configuration.

Symfony allows people to provide the configuration in three different formats: Yaml, XML and PHP. Both Yaml and PHP use the same syntax and are supported by default when using the Config component. Supporting XML requires you to do some more things. But when sharing your bundle with others, it is recommended that you follow these steps.

The Config component provides some methods by default to allow it to correctly process XML configuration. See "Defining and Processing Configuration Values" of the component documentation. However, you can do some optional things as well, this will improve the experience of using XML configuration:

In XML, the XML namespace is used to determine which elements belong to the configuration of a specific bundle. The namespace is returned from the Extension::getNamespace() method. By convention, the namespace is a URL (it doesn't have to be a valid URL nor does it need to exist). By default, the namespace for a bundle is http://example.org/schema/dic/DI_ALIAS, where DI_ALIAS is the DI alias of the extension. You might want to change this to a more professional URL:

The getNamespace() method, together with XML support, is deprecated since Symfony 7.4 and will be removed in Symfony 8.0.

If your bundle needs to remain compatible with older Symfony versions that still support XML, keep this method and add the @deprecated annotation to it.

XML has a very useful feature called XML schema. This allows you to describe all possible elements and attributes and their values in an XML Schema Definition (an XSD file). This XSD file is used by IDEs for auto completion and it is used by the Config component to validate the elements.

In order to use the schema, the XML configuration file must provide an xsi:schemaLocation attribute pointing to the XSD file for a certain XML namespace. This location always starts with the XML namespace. This XML namespace is then replaced with the XSD validation base path returned from Extension::getXsdValidationBasePath() method. This namespace is then followed by the rest of the path from the base path to the file itself.

By convention, the XSD file lives in config/schema/ directory, but you can place it anywhere you like. You should return this path as the base path:

The getXsdValidationBasePath() method, together with XML support, is deprecated since Symfony 7.4 and will be removed in Symfony 8.0.

If your bundle needs to remain compatible with older Symfony versions that still support XML, keep this method and add the @deprecated annotation to it.

Assuming the XSD file is called hello-1.0.xsd, the schema location will be https://acme_company.com/schema/dic/hello/hello-1.0.xsd:

Check Code Performance in Dev, Test, Staging & Production

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (yaml):
```yaml
# config/packages/framework.yaml
framework:
    form: true
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
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd"
>
    <framework:config>
        <framework:form/>
    </framework:config>
</container>
```

Example 3 (php):
```php
// config/packages/framework.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    $framework->form()->enabled(true);
};
```

Example 4 (php):
```php
// src/AcmeSocialBundle.php
namespace Acme\SocialBundle;

use Symfony\Component\Config\Definition\Configurator\DefinitionConfigurator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

class AcmeSocialBundle extends AbstractBundle
{
    public function configure(DefinitionConfigurator $definition): void
    {
        $definition->rootNode()
            ->children()
                ->arrayNode('twitter')
                    ->children()
                        ->integerNode('client_id')->end()
                        ->scalarNode('client_secret')->end()
                    ->end()
                ->end() // twitter
            ->end()
        ;
    }

    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        // the "$config" variable is already merged and processed so you can
        // use it directly to configure the service container (when defining an
        // extension class, you also have to do this merging and processing)
        $container->services()
            ->get('acme_social.twitter_client')
            ->arg(0, $config['twitter']['client_id'])
            ->arg(1, $config['twitter']['client_secret'])
        ;
    }
}
```

---

## How to Simplify Configuration of Multiple Bundles

**URL:** https://symfony.com/doc/7.4/bundles/prepend_extension.html

**Contents:**
- How to Simplify Configuration of Multiple Bundles
- Prepending Extension in the Bundle Class
- More than one Bundle using PrependExtensionInterface

When building reusable and extensible applications, developers are often faced with a choice: either create a single large bundle or multiple smaller bundles. Creating a single bundle has the drawback that it's impossible for users to remove unused functionality. Creating multiple bundles has the drawback that configuration becomes more tedious and settings often need to be repeated for various bundles.

It is possible to remove the disadvantage of the multiple bundle approach by enabling a single Extension to prepend the settings for any bundle. It can use the settings defined in the config/* files to prepend settings just as if they had been written explicitly by the user in the application configuration.

For example, this could be used to configure the entity manager name to use in multiple bundles. Or it can be used to enable an optional feature that depends on another bundle being loaded as well.

To give an Extension the power to do this, it needs to implement PrependExtensionInterface:

Inside the prepend() method, developers have full access to the ContainerBuilder instance just before the load() method is called on each of the registered bundle Extensions. In order to prepend settings to a bundle extension developers can use the prependExtensionConfig() method on the ContainerBuilder instance. As this method only prepends settings, any other settings done explicitly inside the config/* files would override these prepended settings.

The following example illustrates how to prepend a configuration setting in multiple bundles as well as disable a flag in multiple bundles in case a specific other bundle is not registered:

The above would be the equivalent of writing the following into the config/packages/acme_something.yaml in case AcmeGoodbyeBundle is not registered and the entity_manager_name setting for acme_hello is set to non_default:

You can also prepend extension configuration directly in your Bundle class if you extend from the AbstractBundle class and define the prependExtension() method:

The prependExtension() method, like prepend(), is called only at compile time.

Starting from Symfony 7.1, calling the import() method inside prependExtension() will prepend the given configuration. In previous Symfony versions, this method appended the configuration.

Alternatively, you can use the prepend parameter of the extension() method:

The prepend parameter of the extension() method was added in Symfony 7.1.

If there is more than one bundle that prepends the same extension and defines the same key, the bundle that is registered first will take priority: next bundles won't override this specific config setting.

Get your Sylius expertise recognized

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):
```php
// src/DependencyInjection/AcmeHelloExtension.php
namespace Acme\HelloBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class AcmeHelloExtension extends Extension implements PrependExtensionInterface
{
    // ...

    public function prepend(ContainerBuilder $container): void
    {
        // ...
    }
}
```

Example 2 (php):
```php
// src/Acme/HelloBundle/DependencyInjection/AcmeHelloExtension.php
public function prepend(ContainerBuilder $container): void
{
    // get all bundles
    $bundles = $container->getParameter('kernel.bundles');
    // determine if AcmeGoodbyeBundle is registered
    if (!isset($bundles['AcmeGoodbyeBundle'])) {
        // disable AcmeGoodbyeBundle in bundles
        $config = ['use_acme_goodbye' => false];
        foreach ($container->getExtensions() as $name => $extension) {
            match ($name) {
                // set use_acme_goodbye to false in the config of
                // acme_something and acme_other
                //
                // note that if the user manually configured
                // use_acme_goodbye to true in config/services.yaml
                // then the setting would in the end be true and not false
                'acme_something', 'acme_other' => $container->prependExtensionConfig($name, $config),
                default => null
            };
        }
    }

    // get the configuration of AcmeHelloExtension (it's a list of configuration)
    $configs = $container->getExtensionConfig($this->getAlias());

    // iterate in reverse to preserve the original order after prepending the config
    foreach (array_reverse($configs) as $config) {
        // check if entity_manager_name is set in the "acme_hello" configuration
        if (isset($config['entity_manager_name'])) {
            // prepend the acme_something settings with the entity_manager_name
            $container->prependExtensionConfig('acme_something', [
                'entity_manager_name' => $config['entity_manager_name'],
            ]);
        }
    }
}
```

Example 3 (yaml):
```yaml
# config/packages/acme_something.yaml
acme_something:
    # ...
    use_acme_goodbye: false
    entity_manager_name: non_default

acme_other:
    # ...
    use_acme_goodbye: false
```

Example 4 (xml):
```xml
<!-- config/packages/acme_something.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:acme-something="http://example.org/schema/dic/acme_something"
    xmlns:acme-other="http://example.org/schema/dic/acme_other"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://example.org/schema/dic/acme_something
        https://example.org/schema/dic/acme_something/acme_something-1.0.xsd
        http://example.org/schema/dic/acme_other
        https://example.org/schema/dic/acme_something/acme_other-1.0.xsd"
>
    <acme-something:config use-acme-goodbye="false">
        <!-- ... -->
        <acme-something:entity-manager-name>non_default</acme-something:entity-manager-name>
    </acme-something:config>

    <acme-other:config use-acme-goodbye="false">
        <!-- ... -->
    </acme-other:config>

</container>
```

---

## Doctrine Events

**URL:** https://symfony.com/doc/7.4/doctrine/events.html

**Contents:**
- Doctrine Events
- Doctrine Lifecycle Callbacks
- Doctrine Entity Listeners
- Doctrine Lifecycle Listeners

Doctrine, the set of PHP libraries used by Symfony to work with databases, provides a lightweight event system to update entities during the application execution. These events, called lifecycle events, allow performing tasks such as "update the createdAt property automatically right before persisting entities of this type".

Doctrine triggers events before/after performing the most common entity operations (e.g. prePersist/postPersist, preUpdate/postUpdate) and also on other common tasks (e.g. loadClassMetadata, onClear).

There are different ways to listen to these Doctrine events:

The performance of each type of listener depends on how many entities it applies to: lifecycle callbacks are faster than entity listeners, which in turn are faster than lifecycle listeners.

This article only explains the basics about Doctrine events when using them inside a Symfony application. Read the official docs about Doctrine events to learn everything about them.

This article covers listeners for Doctrine ORM. If you are using ODM for MongoDB, read the DoctrineMongoDBBundle documentation.

Lifecycle callbacks are defined as public methods inside the entity you want to modify. For example, suppose you want to set a createdAt date column to the current date, but only when the entity is first persisted (i.e. inserted). To do so, define a callback for the prePersist Doctrine event:

Some lifecycle callbacks receive an argument that provides access to useful information such as the current entity manager (e.g. the preUpdate callback receives a PreUpdateEventArgs $event argument).

Entity listeners are defined as PHP classes that listen to a single Doctrine event on a single entity class. For example, suppose that you want to send some notifications whenever a User entity is modified in the database.

First, define a PHP class that handles the postUpdate Doctrine event:

Then, add the #[AsEntityListener] attribute to the class to enable it as a Doctrine entity listener in your application:

Alternatively, if you prefer to not use PHP attributes, you must configure a service for the entity listener and tag it with the doctrine.orm.entity_listener tag as follows:

Lifecycle listeners are defined as PHP classes that listen to a single Doctrine event on all the application entities. For example, suppose that you want to update some search index whenever a new entity is persisted in the database. To do so, define a listener for the postPersist Doctrine event:

In previous Doctrine versions, instead of PostPersistEventArgs, you had to use LifecycleEventArgs, which was deprecated in Doctrine ORM 2.14.

Then, add the #[AsDoctrineListener] attribute to the class to enable it as a Doctrine listener in your application:

Alternatively, if you prefer to not use PHP attributes, you must enable the listener in the Symfony application by creating a new service for it and tagging it with the doctrine.event_listener tag:

The AsDoctrineListener attribute was introduced in DoctrineBundle 2.8.0.

The value of the connection option can also be a configuration parameter.

Get your Symfony expertise recognized

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):
```php
// src/Entity/Product.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

// When using attributes, don't forget to add #[ORM\HasLifecycleCallbacks]
// to the class of the entity where you define the callback

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Product
{
    // ...

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }
}
```

Example 2 (markdown):
```markdown
# config/doctrine/Product.orm.yml
App\Entity\Product:
    type: entity
    # ...
    lifecycleCallbacks:
        prePersist: ['setCreatedAtValue']
```

Example 3 (xml):
```xml
<!-- config/doctrine/Product.orm.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<doctrine-mapping xmlns="http://doctrine-project.org/schemas/orm/doctrine-mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://doctrine-project.org/schemas/orm/doctrine-mapping
        https://doctrine-project.org/schemas/orm/doctrine-mapping.xsd">

    <entity name="App\Entity\Product">
        <!-- ... -->
        <lifecycle-callbacks>
            <lifecycle-callback type="prePersist" method="setCreatedAtValue"/>
        </lifecycle-callbacks>
    </entity>
</doctrine-mapping>
```

Example 4 (php):
```php
// src/EventListener/UserChangedNotifier.php
namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\Event\PostUpdateEventArgs;

class UserChangedNotifier
{
    // the entity listener methods receive two arguments:
    // the entity instance and the lifecycle event
    public function postUpdate(User $user, PostUpdateEventArgs $event): void
    {
        // ... do something to notify the changes
    }
}
```

---

## Form Events

**URL:** https://symfony.com/doc/7.4/form/events.html

**Contents:**
- Form Events
- The Form Workflow
  - 1) Pre-populating the Form (FormEvents::PRE_SET_DATA and FormEvents::POST_SET_DATA)
    - A) The FormEvents::PRE_SET_DATA Event
    - B) The FormEvents::POST_SET_DATA Event
  - 2) Submitting a Form (FormEvents::PRE_SUBMIT, FormEvents::SUBMIT and FormEvents::POST_SUBMIT)
    - A) The FormEvents::PRE_SUBMIT Event
    - B) The FormEvents::SUBMIT Event
    - C) The FormEvents::POST_SUBMIT Event
- Registering Event Listeners or Event Subscribers

The Form component provides a structured process to let you customize your forms, by making use of the EventDispatcher component. Using form events, you may modify information or fields at different steps of the workflow: from the population of the form to the submission of the data from the request.

For example, if you need to add a field depending on request values, you can register an event listener to the FormEvents::PRE_SUBMIT event as follows:

In the lifecycle of a form, there are two moments where the form data can be updated:

Two events are dispatched during pre-population of a form, when Form::setData() is called: FormEvents::PRE_SET_DATA and FormEvents::POST_SET_DATA.

The FormEvents::PRE_SET_DATA event is dispatched at the beginning of the Form::setData() method. It is used to modify the data given during pre-population with FormEvent::setData(). The method Form::setData() is locked since the event is dispatched from it and will throw an exception if called from a listener.

See all form events at a glance in the Form Events Information Table.

FormEvents::PRE_SET_DATA in the Form component

The Symfony\Component\Form\Extension\Core\Type\CollectionType form type relies on the Symfony\Component\Form\Extension\Core\EventListener\ResizeFormListener subscriber, listening to the FormEvents::PRE_SET_DATA event in order to reorder the form's fields depending on the data from the pre-populated object, by removing and adding all form rows.

The FormEvents::POST_SET_DATA event is dispatched at the end of the Form::setData() method. This event can be used to modify a form depending on the populated data (adding or removing fields dynamically).

See all form events at a glance in the Form Events Information Table.

FormEvents::POST_SET_DATA in the Form component

The Symfony\Component\Form\Extension\DataCollector\EventListener\DataCollectorListener class is subscribed to listen to the FormEvents::POST_SET_DATA event in order to collect information about the forms from the denormalized model and view data.

Three events are dispatched when Form::handleRequest() or Form::submit() are called: FormEvents::PRE_SUBMIT, FormEvents::SUBMIT, FormEvents::POST_SUBMIT.

The FormEvents::PRE_SUBMIT event is dispatched at the beginning of the Form::submit() method.

See all form events at a glance in the Form Events Information Table.

FormEvents::PRE_SUBMIT in the Form component

The Symfony\Component\Form\Extension\Core\EventListener\TrimListener subscriber subscribes to the FormEvents::PRE_SUBMIT event in order to trim the request's data (for string values). The Symfony\Component\Form\Extension\Csrf\EventListener\CsrfValidationListener subscriber subscribes to the FormEvents::PRE_SUBMIT event in order to validate the CSRF token.

The FormEvents::SUBMIT event is dispatched right before the Form::submit() method transforms back the normalized data to the model and view data.

It can be used to change data from the normalized representation of the data.

See all form events at a glance in the Form Events Information Table.

At this point, you cannot add or remove fields to the form.

FormEvents::SUBMIT in the Form component

The Symfony\Component\Form\Extension\Core\EventListener\FixUrlProtocolListener subscribes to the FormEvents::SUBMIT event in order to prepend a default protocol to URL fields that were submitted without a protocol.

The FormEvents::POST_SUBMIT event is dispatched after the Form::submit() once the model and view data have been denormalized.

It can be used to fetch data after denormalization.

See all form events at a glance in the Form Events Information Table.

At this point, you cannot add or remove fields to the current form and its children.

FormEvents::POST_SUBMIT in the Form component

The Symfony\Component\Form\Extension\DataCollector\EventListener\DataCollectorListener subscribes to the FormEvents::POST_SUBMIT event in order to collect information about the forms. The Symfony\Component\Form\Extension\Validator\EventListener\ValidationListener subscribes to the FormEvents::POST_SUBMIT event in order to automatically validate the denormalized object.

In order to be able to use Form events, you need to create an event listener or an event subscriber and register it to an event.

The name of each of the "form" events is defined as a constant on the FormEvents class. Additionally, each event callback (listener or subscriber method) is passed a single argument, which is an instance of FormEvent. The event object contains a reference to the current state of the form and the current data being processed.

An event listener may be any type of valid callable. For example, you can define an event listener function inline right in the addEventListener method of the FormFactory:

When you have created a form type class, you can use one of its methods as a callback for better readability:

Event subscribers have different uses:

Consider the following example of a form event subscriber:

To register the event subscriber, use the addEventSubscriber() method:

Code consumes server resources. Blackfire tells you how

Put the code quality back at the heart of your project

**Examples:**

Example 1 (php):
```php
// ...

use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

$listener = function (FormEvent $event): void {
    // ...
};

$form = $formFactory->createBuilder()
    // ... add form fields
    ->addEventListener(FormEvents::PRE_SUBMIT, $listener);

// ...
```

Example 2 (php):
```php
// ...

use Symfony\Component\Form\Event\PreSubmitEvent;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormEvents;

$form = $formFactory->createBuilder()
    ->add('username', TextType::class)
    ->add('showEmail', CheckboxType::class)
    ->addEventListener(FormEvents::PRE_SUBMIT, function (PreSubmitEvent $event): void {
        $user = $event->getData();
        $form = $event->getForm();

        if (!$user) {
            return;
        }

        // checks whether the user has chosen to display their email or not.
        // If the data was submitted previously, the additional value that is
        // included in the request variables needs to be removed.
        if (isset($user['showEmail']) && $user['showEmail']) {
            $form->add('email', EmailType::class);
        } else {
            unset($user['email']);
            $event->setData($user);
        }
    })
    ->getForm();

// ...
```

Example 3 (php):
```php
// src/Form/SubscriptionType.php
namespace App\Form;

use Symfony\Component\Form\Event\PreSetDataEvent;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormEvents;

// ...
class SubscriptionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('username', TextType::class)
            ->add('showEmail', CheckboxType::class)
            ->addEventListener(
                FormEvents::PRE_SET_DATA,
                [$this, 'onPreSetData']
            )
        ;
    }

    public function onPreSetData(PreSetDataEvent $event): void
    {
        // ...
    }
}
```

Example 4 (php):
```php
// src/Form/EventListener/AddEmailFieldListener.php
namespace App\Form\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\Event\PreSetDataEvent;
use Symfony\Component\Form\Event\PreSubmitEvent;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormEvents;

class AddEmailFieldListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            FormEvents::PRE_SET_DATA => 'onPreSetData',
            FormEvents::PRE_SUBMIT   => 'onPreSubmit',
        ];
    }

    public function onPreSetData(PreSetDataEvent $event): void
    {
        $user = $event->getData();
        $form = $event->getForm();

        // checks whether the user from the initial data has chosen to
        // display their email or not.
        if (true === $user->isShowEmail()) {
            $form->add('email', EmailType::class);
        }
    }

    public function onPreSubmit(PreSubmitEvent $event): void
    {
        $user = $event->getData();
        $form = $event->getForm();

        if (!$user) {
            return;
        }

        // checks whether the user has chosen to display their email or not.
        // If the data was submitted previously, the additional value that
        // is included in the request variables needs to be removed.
        if (isset($user['showEmail']) && $user['showEmail']) {
            $form->add('email', EmailType::class);
        } else {
            unset($user['email']);
            $event->setData($user);
        }
    }
}
```

---

## How to Dynamically Modify Forms Using Form Events

**URL:** https://symfony.com/doc/7.4/form/dynamic_form_modification.html

**Contents:**
- How to Dynamically Modify Forms Using Form Events
- Customizing your Form Based on the Underlying Data
  - Adding an Event Listener to a Form Class
  - Adding an Event Subscriber to a Form Class
- How to Dynamically Generate Forms Based on User Data
  - Creating the Form Type
  - Customizing the Form Type
  - Using the Form
- Dynamic Generation for Submitted Forms

Oftentimes, a form can't be created statically. In this article, you'll learn how to customize your form based on three common use-cases:

Customizing your Form Based on the Underlying Data

Example: you have a "Product" form and need to modify/add/remove a field based on the data on the underlying Product being edited.

How to Dynamically Generate Forms Based on User Data

Example: you create a "Friend Message" form and need to build a drop-down that contains only users that are friends with the current authenticated user.

Dynamic Generation for Submitted Forms

Example: on a registration form, you have a "country" field and a "state" field which should populate dynamically based on the value in the "country" field.

If you wish to learn more about the basics behind form events, you can take a look at the Form Events documentation.

Before starting with dynamic form generation, remember what a bare form class looks like:

If this particular section of code isn't already familiar to you, you probably need to take a step back and first review the Forms article before proceeding.

Assume for a moment that this form utilizes an imaginary "Product" class that has only two properties ("name" and "price"). The form generated from this class will look the exact same regardless if a new Product is being created or if an existing product is being edited (e.g. a product fetched from the database).

Suppose now, that you don't want the user to be able to change the name value once the object has been created. To do this, you can rely on Symfony's EventDispatcher component system to analyze the data on the object and modify the form based on the Product object's data. In this article, you'll learn how to add this level of flexibility to your forms.

So, instead of directly adding that name widget, the responsibility of creating that particular field is delegated to an event listener:

The goal is to create a name field only if the underlying Product object is new (e.g. hasn't been persisted to the database). Based on that, the event listener might look like the following:

The FormEvents::PRE_SET_DATA line actually resolves to the string form.pre_set_data. FormEvents serves an organizational purpose. It is a centralized location in which you can find all of the various form events available. You can view the full list of form events via the FormEvents class.

For better reusability or if there is some heavy logic in your event listener, you can also move the logic for creating the name field to an event subscriber:

Great! Now use that in your form class:

Sometimes you want a form to be generated dynamically based not only on data from the form but also on something else - like some data from the current user. Suppose you have a social website where a user can only message people marked as friends on the website. In this case, a "choice list" of whom to message should only contain users that are the current user's friends.

Using an event listener, your form might look like this:

The problem is now to get the current user and create a choice field that contains only this user's friends. This can be done by injecting the Security service into the form type so you can get the current user object:

Now that you have all the basics in place you can use the features of the security helper to fill in the listener logic:

You might wonder, now that you have access to the User object, why not just use it directly in buildForm() and omit the event listener? This is because doing so in the buildForm() method would result in the whole form type being modified and not just this one form instance. This may not usually be a problem, but technically a single form type could be used on a single request to create many forms or fields.

If you're using the default services.yaml configuration, your form is ready to be used thanks to autowire and autoconfigure. Otherwise, register the form class as a service and tag it with the form.type tag.

In a controller, create the form like normal:

You can also embed the form type into another form:

Another case that can appear is that you want to customize the form specific to the data that was submitted by the user. For example, imagine you have a registration form for sports gatherings. Some events will allow you to specify your preferred position on the field. This would be a choice field for example. However, the possible choices will depend on each sport. Football will have attack, defense, goalkeeper etc... Baseball will have a pitcher but will not have a goalkeeper. You will need the correct options in order for validation to pass.

The meetup is passed as an entity field to the form. So we can access each sport like this:

When you're building this form to display to the user for the first time, then this example works perfectly.

However, things get more difficult when you handle the form submission. This is because the PRE_SET_DATA event tells us the data that you're starting with (e.g. an empty SportMeetup object), not the submitted data.

On a form, we can usually listen to the following events:

The key is to add a POST_SUBMIT listener to the field that your new field depends on. If you add a POST_SUBMIT listener to a form child (e.g. sport), and add new children to the parent form, the Form component will detect the new field automatically and map it to the submitted client data.

The type would now look like:

You can see that you need to listen on these two events and have different callbacks only because in two different scenarios, the data that you can use is available in different events. Other than that, the listeners always perform exactly the same things on a given form.

The FormEvents::POST_SUBMIT event does not allow modifications to the form the listener is bound to, but it allows modifications to its parent.

One piece that is still missing is the client-side updating of your form after the sport is selected. This should be handled by making an AJAX callback to your application. Assume that you have a sport meetup creation controller:

The associated template uses some JavaScript to update the position form field according to the current selection in the sport field:

The major benefit of submitting the whole form to just extract the updated position field is that no additional server-side code is needed; all the code from above to generate the submitted form can be reused.

Become certified from home

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):
```php
// src/Form/Type/ProductType.php
namespace App\Form\Type;

use App\Entity\Product;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('name');
        $builder->add('price');
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Product::class,
        ]);
    }
}
```

Example 2 (php):
```php
// src/Form/Type/ProductType.php
namespace App\Form\Type;

// ...
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('price');

        $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event): void {
            // ... adding the name field if needed
        });
    }

    // ...
}
```

Example 3 (php):
```php
// ...
public function buildForm(FormBuilderInterface $builder, array $options): void
{
    // ...
    $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event): void {
        $product = $event->getData();
        $form = $event->getForm();

        // checks if the Product object is "new"
        // If no data is passed to the form, the data is "null".
        // This should be considered a new "Product"
        if (!$product || null === $product->getId()) {
            $form->add('name', TextType::class);
        }
    });
}
```

Example 4 (php):
```php
// src/Form/EventSubscriber/AddNameFieldSubscriber.php
namespace App\Form\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class AddNameFieldSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        // Tells the dispatcher that you want to listen on the form.pre_set_data
        // event and that the preSetData method should be called.
        return [FormEvents::PRE_SET_DATA => 'preSetData'];
    }

    public function preSetData(FormEvent $event): void
    {
        $product = $event->getData();
        $form = $event->getForm();

        if (!$product || null === $product->getId()) {
            $form->add('name', TextType::class);
        }
    }
}
```

---

## Using Events

**URL:** https://symfony.com/doc/7.4/components/console/events.html

**Contents:**
- Using Events
- The ConsoleEvents::COMMAND Event
  - Disable Commands inside Listeners
- The ConsoleEvents::ERROR Event
- The ConsoleEvents::TERMINATE Event
- The ConsoleEvents::SIGNAL Event

The Application class of the Console component allows you to optionally hook into the lifecycle of a console application via events. Instead of reinventing the wheel, it uses the Symfony EventDispatcher component to do the work:

Console events are only triggered by the main command being executed. Commands called by the main command will not trigger any event, unless run by the application itself, see How to Call Other Commands.

Typical Purposes: Doing something before any command is run (like logging which command is going to be executed), or displaying something about the event to be executed.

Just before executing any command, the ConsoleEvents::COMMAND event is dispatched. Listeners receive a ConsoleCommandEvent event:

Using the disableCommand() method, you can disable a command inside a listener. The application will then not execute the command, but instead will return the code 113 (defined in ConsoleCommandEvent::RETURN_CODE_DISABLED). This code is one of the reserved exit codes for console commands that conform with the C/C++ standard:

Typical Purposes: Handle exceptions thrown during the execution of a command.

Whenever an exception is thrown by a command, including those triggered from event listeners, the ConsoleEvents::ERROR event is dispatched. A listener can wrap or change the exception or do anything useful before the exception is thrown by the application.

Listeners receive a ConsoleErrorEvent event:

Typical Purposes: To perform some cleanup actions after the command has been executed.

After the command has been executed, the ConsoleEvents::TERMINATE event is dispatched. It can be used to do any actions that need to be executed for all commands or to cleanup what you initiated in a ConsoleEvents::COMMAND listener (like sending logs, closing a database connection, sending emails, ...). A listener might also change the exit code.

Listeners receive a ConsoleTerminateEvent event:

This event is also dispatched when an exception is thrown by the command. It is then dispatched just after the ConsoleEvents::ERROR event. The exit code received in this case is the exception code.

Additionally, the event is dispatched when the command is being exited on a signal. You can learn more about signals in the the dedicated section.

Typical Purposes: To perform some actions after the command execution was interrupted.

Signals are asynchronous notifications sent to a process in order to notify it of an event that occurred. For example, when you press Ctrl + C in a command, the operating system sends the SIGINT signal to it.

When a command is interrupted, Symfony dispatches the ConsoleEvents::SIGNAL event. Listen to this event so you can perform some actions (e.g. logging some results, cleaning some temporary files, etc.) before finishing the command execution.

Listeners receive a ConsoleSignalEvent event:

It is also possible to abort the exit if you want the command to continue its execution even after the event has been dispatched, thanks to the abortExit() method:

All the available signals (SIGINT, SIGQUIT, etc.) are defined as constants of the PCNTL PHP extension. The extension has to be installed for these constants to be available.

If you use the Console component inside a Symfony application, commands can handle signals themselves by subscribing to the ConsoleSignalEvent event:

Symfony doesn't handle any signal received by the command (not even SIGKILL, SIGTERM, etc). This behavior is intended, as it gives you the flexibility to handle all signals e.g. to do some tasks before terminating the command.

If you need to fetch the signal name from its integer value (e.g. for logging), you can use the getSignalName() method.

Show your Symfony expertise

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (php):
```php
use Symfony\Component\Console\Application;
use Symfony\Component\EventDispatcher\EventDispatcher;

$dispatcher = new EventDispatcher();

$application = new Application();
$application->setDispatcher($dispatcher);
$application->run();
```

Example 2 (php):
```php
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\Console\Event\ConsoleCommandEvent;

$dispatcher->addListener(ConsoleEvents::COMMAND, function (ConsoleCommandEvent $event): void {
    // gets the input instance
    $input = $event->getInput();

    // gets the output instance
    $output = $event->getOutput();

    // gets the command to be executed
    $command = $event->getCommand();

    // writes something about the command
    $output->writeln(sprintf('Before running command <info>%s</info>', $command->getName()));

    // gets the application
    $application = $command->getApplication();
});
```

Example 3 (php):
```php
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\Console\Event\ConsoleCommandEvent;

$dispatcher->addListener(ConsoleEvents::COMMAND, function (ConsoleCommandEvent $event): void {
    // gets the command to be executed
    $command = $event->getCommand();

    // ... check if the command can be executed

    // disables the command, this will result in the command being skipped
    // and code 113 being returned from the Application
    $event->disableCommand();

    // it is possible to enable the command in a later listener
    if (!$event->commandShouldRun()) {
        $event->enableCommand();
    }
});
```

Example 4 (php):
```php
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\Console\Event\ConsoleErrorEvent;

$dispatcher->addListener(ConsoleEvents::ERROR, function (ConsoleErrorEvent $event): void {
    $output = $event->getOutput();

    $command = $event->getCommand();

    $output->writeln(sprintf('Oops, exception thrown while running command <info>%s</info>', $command->getName()));

    // gets the current exit code (the exception code)
    $exitCode = $event->getExitCode();

    // changes the exception to another one
    $event->setError(new \LogicException('Caught exception', $exitCode, $event->getError()));
});
```

---

## The HttpKernel Component: the Controller Resolver

**URL:** https://symfony.com/doc/7.4/create_framework/http_kernel_controller_resolver.html

**Contents:**
- The HttpKernel Component: the Controller Resolver

You might think that our framework is already pretty solid and you are probably right. But it can still be improved.

Right now, all our examples use procedural code, but remember that controllers can be any valid PHP callbacks. Let's convert our controller to a proper class:

Update the route definition accordingly:

The move is pretty straightforward and makes a lot of sense as soon as you create more pages but you might have noticed a non-desirable side effect... The LeapYearController class is always instantiated, even if the requested URL does not match the leap_year route. This is bad for one main reason: performance-wise, all controllers for all routes must now be instantiated for every request. It would be better if controllers were lazy-loaded so that only the controller associated with the matched route is instantiated.

To solve this issue, and a bunch more, let's install and use the HttpKernel component:

The HttpKernel component has many interesting features, but the ones we need right now are the controller resolver and argument resolver. A controller resolver knows how to determine the controller to execute and the argument resolver determines the arguments to pass to it, based on a Request object. All controller resolvers implement the following interface:

The getController() method relies on the same convention as the one we have defined earlier: the _controller request attribute must contain the controller associated with the Request. Besides the built-in PHP callbacks, getController() also supports strings composed of a class name followed by two colons and a method name as a valid callback, like 'class::method':

To make this code work, modify the framework code to use the controller resolver from HttpKernel:

As an added bonus, the controller resolver properly handles the error management for you: when you forget to define a _controller attribute for a Route for instance.

Now, let's see how the controller arguments are guessed. getArguments() introspects the controller signature to determine which arguments to pass to it by using the native PHP reflection. This method is defined in the following interface:

The index() method needs the Request object as an argument. getArguments() knows when to inject it properly if it is type-hinted correctly:

More interesting, getArguments() is also able to inject any Request attribute; if the argument has the same name as the corresponding attribute:

You can also inject the Request and some attributes at the same time (as the matching is done on the argument name or a type hint, the arguments order does not matter):

Finally, you can also define default values for any argument that matches an optional attribute of the Request:

Let's inject the $year request attribute for our controller:

The resolvers also take care of validating the controller callable and its arguments. In case of a problem, it throws an exception with a nice message explaining the problem (the controller class does not exist, the method is not defined, an argument has no matching attribute, ...).

With the great flexibility of the default controller resolver and argument resolver, you might wonder why someone would want to create another one (why would there be an interface if not?). Two examples: in Symfony, getController() is enhanced to support controllers as services; and getArguments() provides an extension point to alter or enhance the resolving of arguments.

Let's conclude with the new version of our framework:

Think about it once more: our framework is more robust and more flexible than ever and it still has less than 50 lines of code.

Symfony Code Performance Profiling

Make sure your project is risk free

**Examples:**

Example 1 (php):
```php
class LeapYearController
{
    public function index($request): Response
    {
        if (is_leap_year($request->attributes->get('year'))) {
            return new Response('Yep, this is a leap year!');
        }

        return new Response('Nope, this is not a leap year.');
    }
}
```

Example 2 (javascript):
```javascript
$routes->add('leap_year', new Routing\Route('/is_leap_year/{year}', [
    'year' => null,
    '_controller' => [new LeapYearController(), 'index'],
]));
```

Example 3 (unknown):
```unknown
$ composer require symfony/http-kernel
```

Example 4 (php):
```php
namespace Symfony\Component\HttpKernel\Controller;

// ...
interface ControllerResolverInterface
{
    public function getController(Request $request);
}
```

---

## The HttpKernel Component: HttpKernelInterface

**URL:** https://symfony.com/doc/7.4/create_framework/http_kernel_httpkernelinterface.html

**Contents:**
- The HttpKernel Component: HttpKernelInterface

In the conclusion of the second chapter of this book, I've talked about one great benefit of using the Symfony components: the interoperability between all frameworks and applications using them. Let's do a big step towards this goal by making our framework implement HttpKernelInterface:

HttpKernelInterface is probably the most important piece of code in the HttpKernel component, no kidding. Frameworks and applications that implement this interface are fully interoperable. Moreover, a lot of great features will come with it for free.

Update your framework so that it implements this interface:

With this change, a little goes a long way! Let's talk about one of the most impressive upsides: transparent HTTP caching support.

The HttpCache class implements a fully-featured reverse proxy, written in PHP; it implements HttpKernelInterface and wraps another HttpKernelInterface instance:

That's all it takes to add HTTP caching support to our framework. Isn't it amazing?

Configuring the cache needs to be done via HTTP cache headers. For instance, to cache a response for 10 seconds, use the Response::setTtl() method:

If you are running your framework from the command line by simulating requests (Request::create('/is_leap_year/2012')), you can debug Response instances by dumping their string representation (echo $response;) as it displays all headers as well as the response content.

To validate that it works correctly, add a random number to the response content and check that the number only changes every 10 seconds:

When deploying to your production environment, keep using the Symfony reverse proxy (great for shared hosting) or even better, switch to a more efficient reverse proxy like Varnish.

Using HTTP cache headers to manage your application cache is very powerful and allows you to tune finely your caching strategy as you can use both the expiration and the validation models of the HTTP specification. If you are not comfortable with these concepts, read the HTTP caching chapter of the Symfony documentation.

The Response class contains methods that let you configure the HTTP cache. One of the most powerful is setCache() as it abstracts the most frequently used caching strategies into a single array:

When using the validation model, the isNotModified() method allows you to cut on the response time by short-circuiting the response generation as early as possible:

Using HTTP caching is great, but what if you cannot cache the whole page? What if you can cache everything but some sidebar that is more dynamic that the rest of the content? Edge Side Includes (ESI) to the rescue! Instead of generating the whole content in one go, ESI allows you to mark a region of a page as being the content of a sub-request call:

For ESI tags to be supported by HttpCache, you need to pass it an instance of the ESI class. The ESI class automatically parses ESI tags and makes sub-requests to convert them to their proper content:

For ESI to work, you need to use a reverse proxy that supports it like the Symfony implementation. Varnish is the best alternative and it is Open-Source.

When using complex HTTP caching strategies and/or many ESI include tags, it can be hard to understand why and when a resource should be cached or not. To ease debugging, you can enable the debug mode:

The debug mode adds a X-Symfony-Cache header to each response that describes what the cache layer did:

HttpCache has many features like support for the stale-while-revalidate and stale-if-error HTTP Cache-Control extensions as defined in RFC 5861.

With the addition of a single interface, our framework can now benefit from the many features built into the HttpKernel component; HTTP caching being just one of them but an important one as it can make your applications fly!

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Make sure your project is risk free

**Examples:**

Example 1 (php):
```php
namespace Symfony\Component\HttpKernel;

// ...
interface HttpKernelInterface
{
    /**
     * @return Response A Response instance
     */
    public function handle(
        Request $request,
        int $type = self::MAIN_REQUEST,
        bool $catch = true
    ): Response;
}
```

Example 2 (php):
```php
// example.com/src/Framework.php

// ...
use Symfony\Component\HttpKernel\HttpKernelInterface;

class Framework implements HttpKernelInterface
{
    // ...

    public function handle(
        Request $request,
        int $type = HttpKernelInterface::MAIN_REQUEST,
        bool $catch = true
    ) {
        // ...
    }
}
```

Example 3 (php):
```php
// example.com/web/front.php

// ...
use Symfony\Component\HttpKernel;

$framework = new Simplex\Framework($dispatcher, $matcher, $controllerResolver, $argumentResolver);
$framework = new HttpKernel\HttpCache\HttpCache(
    $framework,
    new HttpKernel\HttpCache\Store(__DIR__.'/../cache')
);

$response = $framework->handle($request);
$response->send();
```

Example 4 (php):
```php
// example.com/src/Calendar/Controller/LeapYearController.php

// ...
public function index(Request $request, int $year): Response
{
    $leapYear = new LeapYear();
    if ($leapYear->isLeapYear($year)) {
        $response = new Response('Yep, this is a leap year!');
    } else {
        $response = new Response('Nope, this is not a leap year.');
    }

    $response->setTtl(10);

    return $response;
}
```

---

## The HttpKernel Component: The HttpKernel Class

**URL:** https://symfony.com/doc/7.4/create_framework/http_kernel_httpkernel_class.html

**Contents:**
- The HttpKernel Component: The HttpKernel Class

If you were to use our framework right now, you would probably have to add support for custom error messages. We do have 404 and 500 error support but the responses are hardcoded in the framework itself. Making them customizable is straightforward though: dispatch a new event and listen to it. Doing it right means that the listener has to call a regular controller. But what if the error controller throws an exception? You will end up in an infinite loop. There should be an easier way, right?

Enter the HttpKernel class. Instead of solving the same problem over and over again and instead of reinventing the wheel each time, the HttpKernel class is a generic, extensible and flexible implementation of HttpKernelInterface.

This class is very similar to the framework class we have written so far: it dispatches events at some strategic points during the handling of the request, it uses a controller resolver to choose the controller to dispatch the request to, and as an added bonus, it takes care of edge cases and provides great feedback when a problem arises.

Here is the new framework code:

And the new front controller:

RouterListener is an implementation of the same logic we had in our framework: it matches the incoming request and populates the request attributes with route parameters.

Our code is now much more concise and surprisingly more robust and more powerful than ever. For instance, use the built-in ErrorListener to make your error management configurable:

ErrorListener gives you a FlattenException instance instead of the thrown Exception or Error instance to ease exception manipulation and display. It can take any valid controller as an exception handler, so you can create an ErrorController class instead of using a Closure:

The error controller reads as follows:

Voilà! Clean and customizable error management without efforts. And if your ErrorController throws an exception, HttpKernel will handle it nicely.

In chapter two, we talked about the Response::prepare() method, which ensures that a Response is compliant with the HTTP specification. It is probably a good idea to always call it just before sending the Response to the client; that's what the ResponseListener does:

And in your controller, return a StreamedResponse instance instead of a Response instance.

Read the Built-in Symfony Events reference to learn more about the events dispatched by HttpKernel and how they allow you to change the flow of a request.

Now, let's create a listener, one that allows a controller to return a string instead of a full Response object:

To implement this feature, we are going to listen to the kernel.view event, which is triggered just after the controller has been called. Its goal is to convert the controller return value to a proper Response instance, but only if needed:

The code is simple because the kernel.view event is only triggered when the controller return value is not a Response and because setting the response on the event stops the event propagation (our listener cannot interfere with other view listeners).

Don't forget to register it in the front controller:

If you forget to register the subscriber, HttpKernel will throw an exception with a nice message: The controller must return a response (Nope, this is not a leap year. given)..

At this point, our whole framework code is as compact as possible and it is mainly composed of an assembly of existing libraries. Extending is a matter of registering event listeners/subscribers.

Hopefully, you now have a better understanding of why the simple looking HttpKernelInterface is so powerful. Its default implementation, HttpKernel, gives you access to a lot of cool and ready to be used features, with no efforts. And because HttpKernel is actually the code that powers the Symfony framework, you have the best of both worlds: a custom framework, tailored to your needs, but based on a rock-solid and well maintained low-level architecture that has been proven to work for many websites; a code that has been audited for security issues and that has proven to scale well.

Check Code Performance in Dev, Test, Staging & Production

Become certified from home

**Examples:**

Example 1 (php):
```php
// example.com/src/Simplex/Framework.php
namespace Simplex;

use Symfony\Component\HttpKernel\HttpKernel;

class Framework extends HttpKernel
{
}
```

Example 2 (php):
```php
// example.com/web/front.php
require_once __DIR__.'/../vendor/autoload.php';

use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel;
use Symfony\Component\Routing;

$request = Request::createFromGlobals();
$requestStack = new RequestStack();
$routes = include __DIR__.'/../src/app.php';

$context = new Routing\RequestContext();
$matcher = new Routing\Matcher\UrlMatcher($routes, $context);

$controllerResolver = new HttpKernel\Controller\ControllerResolver();
$argumentResolver = new HttpKernel\Controller\ArgumentResolver();

$dispatcher = new EventDispatcher();
$dispatcher->addSubscriber(new HttpKernel\EventListener\RouterListener($matcher, $requestStack));

$framework = new Simplex\Framework($dispatcher, $controllerResolver, $requestStack, $argumentResolver);

$response = $framework->handle($request);
$response->send();
```

Example 3 (php):
```php
$errorHandler = function (Symfony\Component\ErrorHandler\Exception\FlattenException $exception): Response {
    $msg = 'Something went wrong! ('.$exception->getMessage().')';

    return new Response($msg, $exception->getStatusCode());
};
$dispatcher->addSubscriber(new HttpKernel\EventListener\ErrorListener($errorHandler));
```

Example 4 (php):
```php
$listener = new HttpKernel\EventListener\ErrorListener(
    'Calendar\Controller\ErrorController::exception'
);
$dispatcher->addSubscriber($listener);
```

---
