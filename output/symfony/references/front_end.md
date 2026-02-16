# Symfony - Front End

**Pages:** 2

---

## AssetMapper: Simple, Modern CSS & JS Management

**URL:** https://symfony.com/doc/7.4/frontend/asset_mapper.html

**Contents:**
- AssetMapper: Simple, Modern CSS & JS Management
- Installation
- Mapping and Referencing Assets
  - Serving Assets in dev vs prod
  - Debugging: Seeing All Mapped Assets
- Importmaps & Writing JavaScript
  - Importing 3rd Party JavaScript Packages
  - Removing JavaScript Packages
  - How does the importmap Work?
  - The "app" Entrypoint & Preloading

The AssetMapper component lets you write modern JavaScript and CSS without the complexity of using a bundler. Browsers already support many modern JavaScript features like the import statement and ES6 classes. And the HTTP/2 protocol means that combining your assets to reduce HTTP connections is no longer urgent. This component is a light layer that helps serve your files directly to the browser.

The component has two main features:

To install the AssetMapper component, run:

In addition to symfony/asset-mapper, this also makes sure that you have the Asset Component and Twig available.

If you're using Symfony Flex, you're done! The recipe just added a number of files:

It also updated the templates/base.html.twig file:

If you're not using Flex, you'll need to create & update these files manually. See the latest asset-mapper recipe for the exact content of these files.

The AssetMapper component works by defining directories/paths of assets that you want to expose publicly. These assets are then versioned and easy to reference. Thanks to the asset_mapper.yaml file, your app starts with one mapped path: the assets/ directory.

If you create an assets/images/duck.png file, you can reference it in a template with:

The path - images/duck.png - is relative to your mapped directory (assets/). This is known as the logical path to your asset.

If you look at the HTML in your page, the URL will be something like: /assets/images/duck-3c16d92m.png. If you change the file, the version part of the URL will also change automatically.

In the dev environment, the URL /assets/images/duck-3c16d92m.png is handled and returned by your Symfony app.

For the prod environment, before deploy, you should run:

This will physically copy all the files from your mapped directories to public/assets/ so that they're served directly by your web server. See Deployment for more details.

If you run the asset-map:compile command on your development machine, you won't see any changes made to your assets when reloading the page. To resolve this, delete the contents of the public/assets/ directory. This will allow your Symfony application to serve those assets dynamically again.

If you need to copy the compiled assets to a different location (e.g. upload them to S3), create a service that implements Symfony\Component\AssetMapper\Path\PublicAssetsFilesystemInterface and set its service id (or an alias) to asset_mapper.local_public_assets_filesystem (to replace the built-in service).

To see all of the mapped assets in your app, run:

This will show you all the mapped paths and the assets inside of each:

The "Logical Path" is the path to use when referencing the asset, like from a template.

The debug:asset-map command provides several options to filter results:

The options to filter debug:asset-map results were introduced in Symfony 7.2.

All modern browsers support the JavaScript import statement and modern ES6 features like classes. So this code "just works":

Thanks to the {{ importmap('app') }} Twig function call, which you'll learn about in this section, the assets/app.js file is loaded & executed by the browser.

When importing relative files, be sure to include the .js filename extension. Unlike in Node.js, this extension is required in the browser environment.

Suppose you want to use an npm package, like bootstrap. Technically, this can be done by importing its full URL, like from a CDN:

But yikes! Needing to include that URL is a pain! Instead, we can add this package to our "importmap" via the importmap:require command. This command can be used to add any npm package:

Add the --dry-run option to simulate package installation without actually making any changes (e.g. php bin/console importmap:require bootstrap --dry-run)

The --dry-run option was introduced in Symfony 7.3.

This adds the bootstrap package to your importmap.php file:

Sometimes, a package - like bootstrap - will have one or more dependencies, such as @popperjs/core. The importmap:require command will add both the main package and its dependencies. If a package includes a main CSS file, that will also be added (see Handling 3rd-Party CSS).

If you get a 404 error, there might be some issue with the JavaScript package that prevents it from being served by the jsDelivr CDN. For example, the package might be missing properties like main or module in its package.json configuration file. Try to contact the package maintainer to ask them to fix those issues.

If you see a network error like *Connection was reset for "https://cdn.jsdelivr.net/npm/..."*, it may be caused by a proxy or firewall restriction. In that case, you can temporarily configure a proxy to connect to the jsDelivr CDN:

Now you can import the bootstrap package like usual:

All packages in importmap.php are downloaded into an assets/vendor/ directory, which should be ignored by git (the Flex recipe adds it to .gitignore for you). You'll need to run the following command to download the files on other computers if some are missing:

You can update your third-party packages to their current versions by running:

If you need to remove a JavaScript package that was previously added to your importmap.php file, use the importmap:remove command. For example, to remove the lodash package:

This updates your importmap.php file and removes the specified package (along with any dependencies that were added with it).

After running this command, it's recommended to also run the following to ensure that your assets/vendor/ directory is in sync with the updated import map:

Removing a package from the import map does not automatically remove any references to it in your JavaScript files. Make sure to update your code and remove any import statements that reference the removed package.

How does this importmap.php file allow you to import bootstrap? That's thanks to the {{ importmap() }} Twig function in base.html.twig, which outputs an importmap:

Import maps are a native browser feature. When you import bootstrap from JavaScript, the browser will look at the importmap and see that it should fetch the package from the associated path.

But where did the /assets/duck.js import entry come from? That doesn't live in importmap.php. Great question!

The assets/app.js file above imports ./duck.js. When you import a file using a relative path, your browser looks for that file relative to the one importing it. So, it would look for /assets/duck.js. That URL would be correct, except that the duck.js file is versioned. Fortunately, the AssetMapper component sees the import and adds a mapping from /assets/duck.js to the correct, versioned filename. The result: importing ./duck.js just works!

The importmap() function also outputs an ES module shim so that older browsers understand importmaps (see the polyfill config).

An "entrypoint" is the main JavaScript file that the browser loads, and your app starts with one by default:

In addition to the importmap, the {{ importmap('app') }} in base.html.twig outputs a few other things, including:

This line tells the browser to load the app importmap entry, which causes the code in assets/app.js to be executed.

The importmap() function also outputs a set of "preloads":

This is a performance optimization and you can learn more about below in Performance: Add Preloading.

Sometimes you'll need to import a specific file from a package. For example, suppose you're integrating highlight.js and want to import just the core and a specific language:

In this case, adding the highlight.js package to your importmap.php file won't work: whatever you import - e.g. highlight.js/lib/core - needs to exactly match an entry in the importmap.php file.

Instead, use importmap:require and pass it the exact paths you need. This also shows how you can require multiple packages at once:

You might be accustomed to relying on global variables - like jQuery's $ variable:

But in a module environment (like with AssetMapper), when you import a library like jquery, it does not create a global variable. Instead, you should import it and set it to a variable in every file you need it:

You can even do this from an inline script tag:

If you do need something to become a global variable, you do it manually from inside app.js:

CSS can be added to your page by importing it from a JavaScript file. The default assets/app.js already imports assets/styles/app.css:

When you call importmap('app') in base.html.twig, AssetMapper parses assets/app.js (and any JavaScript files that it imports) looking for import statements for CSS files. The final collection of CSS files is rendered onto the page as link tags in the order they were imported.

Importing a CSS file is not something that is natively supported by JavaScript modules. AssetMapper makes this work by adding a special importmap entry for each CSS file. These special entries are valid, but do nothing. AssetMapper adds a <link> tag for each CSS file, but when JavaScript executes the import statement, nothing additional happens.

Sometimes a JavaScript package will contain one or more CSS files. For example, the bootstrap package has a dist/css/bootstrap.min.css file.

You can require CSS files in the same way as JavaScript files:

To include it on the page, import it from a JavaScript file:

Some packages - like bootstrap - advertise that they contain a CSS file. In those cases, when you importmap:require bootstrap, the CSS file is also added to importmap.php for convenience. If some package doesn't advertise its CSS file in the style property of the package.json configuration file try to contact the package maintainer to ask them to add that.

From inside CSS, you can reference other files using the normal CSS url() function and a relative path to the target file:

The path in the final app.css file will automatically include the versioned URL for duck.png:

To use the Tailwind CSS framework with the AssetMapper component, check out symfonycasts/tailwind-bundle.

To use Sass with AssetMapper component, check out symfonycasts/sass-bundle.

If you have some CSS that you want to load lazily, you can do that via the normal, "dynamic" import syntax:

In this case, lazy.css will be downloaded asynchronously and then added to the page. If you use a dynamic import to lazily-load a JavaScript file and that file imports a CSS file (using the non-dynamic import syntax), that CSS file will also be downloaded asynchronously.

There are a few common errors and problems you might run into.

One of the most common errors will come from your browser's console, and will look something like this:

Failed to resolve module specifier "bootstrap". Relative references must start with either "/", "./", or "../".

The specifier "bootstrap" was a bare specifier, but was not remapped to anything. Relative module specifiers must start with "./", "../" or "/".

This means that, somewhere in your JavaScript, you're importing a 3rd party package - e.g. import 'bootstrap'. The browser tries to find this package in your importmap file, but it's not there.

The fix is almost always to add it to your importmap:

Some browsers, like Firefox, show where this "import" code lives, while others like Chrome currently do not.

Sometimes a JavaScript file you're importing (e.g. import './duck.js'), or a CSS/image file you're referencing won't be found, and you'll see a 404 error in your browser's console. You'll also notice that the 404 URL is missing the version hash in the filename (e.g. a 404 to /assets/duck.js instead of a path like /assets/duck-1b7a64b3.js).

This is usually because the path is wrong. If you're referencing the file directly in a Twig template:

Then the path that you pass asset() should be the "logical path" to the file. Use the debug:asset-map command to see all valid logical paths in your app.

More likely, you're importing the failing asset from a CSS file (e.g. @import url('other.css')) or a JavaScript file:

When doing this, the path should be relative to the file that's importing it (and, in JavaScript files, should start with ./ or ../). In this case, ../farm/chicken.js would point to assets/farm/chicken.js. To see a list of all invalid imports in your app, run:

Any invalid imports will show up as warnings on top of the screen (make sure you have symfony/monolog-bundle installed):

The AssetMapper component looks in your JavaScript files for import lines so that it can automatically add them to your importmap. This is done via regex and works very well, though it isn't perfect. If you comment-out an import, it will still be found and added to your importmap. That doesn't harm anything, but could be surprising.

If the imported path cannot be found, you'll see warning log when that asset is being built, which you can ignore.

When you're ready to deploy, "compile" your assets by running this command:

This will write all your versioned asset files into the public/assets/ directory, along with a few JSON files (manifest.json, importmap.json, etc.) so that the importmap can be rendered lightning fast.

To make your AssetMapper-powered site fly, there are a few things you need to do. If you want to take a shortcut, you can use a service like Cloudflare, which will automatically do most of these things for you:

Once you've done these things, you can use a tool like Lighthouse to check the performance of your site.

One issue that Lighthouse may report is:

Avoid Chaining Critical Requests

To understand the problem, imagine this theoretical setup:

Without preloading, when the browser downloads the page, the following would happen:

Instead of downloading all 3 files in parallel, the browser would be forced to download them one-by-one as it discovers them. That would hurt performance.

AssetMapper avoids this problem by outputting "preload" link tags. The logic works like this:

A) When you call importmap('app') in your template, the AssetMapper component looks at the assets/app.js file and finds all of the JavaScript files that it imports or files that those files import, etc.

B) It then outputs a link tag for each of those files with a rel="preload" attribute. This tells the browser to start downloading those files immediately, even though it hasn't yet seen the import statement for them.

Additionally, if the WebLink Component is available in your application, Symfony will add a Link header in the response to preload the CSS files.

Support for pre-compressing assets was introduced in Symfony 7.3.

Although most web servers (Caddy, Nginx, Apache, FrankenPHP) and services like Cloudflare provide asset compression features, AssetMapper also allows you to compress all your assets before serving them.

This improves performance because you can compress assets using the highest (and slowest) compression ratios beforehand and provide those compressed assets to the server, which then returns them to the client without wasting CPU resources on compression.

AssetMapper supports Brotli, Zstandard and gzip compression formats. Before using any of them, the machine that pre-compresses assets must have installed the following PHP extensions or CLI commands:

Then, update your AssetMapper configuration to define which compression to use and which file extensions should be compressed:

Now, when running the asset-map:compile command, all matching files will be compressed in the configured format and at the highest compression level. The compressed files are created with the same name as the original but with the .br, .zst, or .gz extension appended.

Then, you need to configure your web server to serve the precompressed assets instead of the original ones:

AssetMapper provides an assets:compress CLI command and a service called asset_mapper.compressor that you can use anywhere in your application to compress any kind of files (e.g. files uploaded by users to your application).

Nope! But that's because this is no longer necessary!

In the past, it was common to combine assets to reduce the number of HTTP requests that were made. Thanks to advances in web servers like HTTP/2, it's typically not a problem to keep your assets separate and let the browser download them in parallel. In fact, by keeping them separate, when you update one asset, the browser can continue to use the cached version of all of your other assets.

See Optimization for more details.

Nope! In most cases, this is perfectly fine. The web asset compression performed by web servers before sending them is usually sufficient. However, if you think you could benefit from minifying assets (in addition to later compressing them), you can use the SensioLabs Minify Bundle.

This bundle integrates seamlessly with AssetMapper and minifies all web assets automatically when running the asset-map:compile command (as explained in the serving assets in production section).

See Optimization for more details.

Yes! Very! The AssetMapper component leverages advances in browser technology (like importmaps and native import support) and web servers (like HTTP/2, which allows assets to be downloaded in parallel). See the other questions about minimization and combination and Optimization for more details.

The https://ux.symfony.com site runs on the AssetMapper component and has a 99% Google Lighthouse score.

Yes! Features like importmaps and the import statement are supported in all modern browsers, but the AssetMapper component ships with an ES module shim to support importmap in old browsers. So, it works everywhere (see note below).

Inside your own code, if you're relying on modern ES6 JavaScript features like the class syntax, this is supported in all but the oldest browsers. If you do need to support very old browsers, you should use a tool like Encore instead of the AssetMapper component.

The import statement can't be polyfilled or shimmed to work on every browser. However, only the oldest browsers don't support it - basically IE 11 (which is no longer supported by Microsoft and has less than .4% of global usage).

The importmap feature is shimmed to work in all browsers by the AssetMapper component. However, the shim doesn't work with "dynamic" imports:

If you want to use dynamic imports and need to support certain older browsers (https://caniuse.com/import-maps), you can use an importShim() function from the shim: https://www.npmjs.com/package/es-module-shims#user-content-polyfill-edge-case-dynamic-import

Sure! See Using Tailwind CSS or Using Sass.

Sure! See Using TypeScript.

Probably not. And if you're writing an application in React, Svelte or another frontend framework, you'll probably be better off using their tools directly.

JSX can be compiled directly to a native JavaScript file but if you're using a lot of JSX, you'll probably want to use a tool like Encore. See the UX React Documentation for more details about using it with the AssetMapper component.

Vue files can be written in native JavaScript, and those will work with the AssetMapper component. But you cannot write single-file components (i.e. .vue files) with component, as those must be used in a build system. See the UX Vue.js Documentation for more details about using with the AssetMapper component.

Not with AssetMapper, but you can install kocal/biome-js-bundle in your project to lint and format your front-end assets. It's much faster than alternatives like Prettier and requires no configuration to handle your JavaScript, TypeScript and CSS files.

To use TypeScript with the AssetMapper component, check out sensiolabs/typescript-bundle.

All bundles that have a Resources/public/ or public/ directory will automatically have that directory added as an "asset path", using the namespace: bundles/<BundleName>. For example, if you're using BabdevPagerfantaBundle and you run the debug:asset-map command, you'll see an asset whose logical path is bundles/babdevpagerfanta/css/pagerfanta.css.

This means you can render these assets in your templates using the asset() function:

Actually, this path - bundles/babdevpagerfanta/css/pagerfanta.css - already works in applications without the AssetMapper component, because the assets:install command copies the assets from bundles into public/bundles/. However, when the AssetMapper component is enabled, the pagerfanta.css file will automatically be versioned! It will output something like:

If you want to override a 3rd-party asset, you can do that by creating a file in your assets/ directory with the same name. For example, if you want to override the pagerfanta.css file, create a file at assets/bundles/babdevpagerfanta/css/pagerfanta.css. This file will be used instead of the original file.

If a bundle renders their own assets, but they use a non-default asset package, then the AssetMapper component will not be used. This happens, for example, with EasyAdminBundle.

You can import assets that live outside of your asset path (i.e. the assets/ directory). For example:

However, if you get an error like this:

The "app" importmap entry contains the path "vendor/some/package/assets/foo.js" but it does not appear to be in any of your asset paths.

It means that you're pointing to a valid file, but that file isn't in any of your asset paths. You can fix this by adding the path to your asset_mapper.yaml file:

Then try the command again.

You can see every available configuration options and some info by running:

Some of the more important options are described below.

This config holds all of the directories that will be scanned for assets. This can be a simple list:

Or you can give each path a "namespace" that will be used in the asset map:

In this case, the "logical path" to all of the files in the vendor/some/package/assets/ directory will be prefixed with some-package - e.g. some-package/foo.js.

This is a list of glob patterns that will be excluded from the asset map:

You can use the debug:asset-map command to double-check that the files you expect are being included in the asset map.

Whether to exclude any file starting with a . from the asset mapper. This is useful if you want to avoid leaking sensitive files like .env or .gitignore in the files published by the asset mapper.

This option is enabled by default.

Configure the polyfill for older browsers. By default, the ES module shim is loaded via a CDN (i.e. the default value for this setting is es-module-shims):

You can tell the AssetMapper to load the ES module shim locally by using the following command, without changing your configuration:

This is a list of attributes that will be added to the <script> tags rendered by the {{ importmap() }} Twig function:

Sometimes you may choose to include CSS or JavaScript files only on certain pages. For JavaScript, an easy way is to load the file with a dynamic import:

Another option is to create a separate entrypoint. For example, create a checkout.js file that contains whatever JavaScript and CSS you need:

Next, add this to importmap.php and mark it as an entrypoint:

Finally, on the page that needs this JavaScript, call importmap() and pass both app and checkout:

The importmap() function always includes the full import map to ensure all module definitions are available on the page. It also adds a <script type="module"> tag to load the specific JavaScript entry files you pass to it (in the example above, the app.js file and the checkout.js file).

Do not call parent() inside the {% block importmap %} Twig block. Each page can include only one import map, so importmap() must be called exactly once.

If you want to execute only checkout.js (and not app.js), call {{ importmap('checkout') }}. In this case, the full import map will still be included in the page, but only the checkout.js file will actually be loaded.

If you're using a Content Security Policy (CSP) to prevent cross-site scripting attacks, the inline <script> tags rendered by the importmap() function will likely violate that policy and will not be executed by the browser.

To allow these scripts to run without disabling the security provided by the CSP, you can generate a secure random string for every request (called a nonce) and include it in the CSP header and in a nonce attribute on the <script> tags. The importmap() function accepts an optional second argument that can be used to pass attributes to the rendered <script> tags. You can use the NelmioSecurityBundle to generate the nonce and include it in the CSP header, and then pass the same nonce to the Twig function:

If your importmap includes CSS files, AssetMapper uses a trick to load those by adding data:application/javascript to the rendered importmap (see Handling CSS).

This can cause browsers to report CSP violations and block the CSS files from being loaded. To prevent this, you can add strict-dynamic to the script-src directive of your Content Security Policy, to tell the browser that the importmap is allowed to load other resources.

When using strict-dynamic, the browser will ignore any other sources in script-src such as 'self' or 'unsafe-inline', so any other <script> tags will also need to be trusted via a nonce.

When developing your app in debug mode, the AssetMapper component will calculate the content of each asset file and cache it. Whenever that file changes, the component will automatically re-calculate the content.

The system also accounts for "dependencies": If app.css contains @import url('other.css'), then the app.css file contents will also be re-calculated whenever other.css changes. This is because the version hash of other.css will change... which will cause the final content of app.css to change, since it includes the final other.css filename inside.

Mostly, this system just works. But if you have a file that is not being re-calculated when you expect it to, you can run:

This will force the AssetMapper component to re-calculate the content of all files.

Similar to npm, the AssetMapper component comes bundled with a command that checks security vulnerabilities in the dependencies of your application:

The command will return the 0 exit code if no vulnerability is found, or the 1 exit code otherwise. This means that you can seamlessly integrate this command as part of your CI to be warned anytime a new vulnerability is found.

The command takes a --format option to choose the output format between txt and json.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Make sure your project is risk free

**Examples:**

Example 1 (powershell):
```powershell
$ composer require symfony/asset-mapper symfony/asset symfony/twig-pack
```

Example 2 (json):
```json
{% block javascripts %}
+    {% block importmap %}{{ importmap('app') }}{% endblock %}
{% endblock %}
```

Example 3 (jsx):
```jsx
<img src="{{ asset('images/duck.png') }}">
```

Example 4 (powershell):
```powershell
$ php bin/console asset-map:compile
```

---

## Asset Preloading and Resource Hints with HTTP/2 and WebLink

**URL:** https://symfony.com/doc/7.4/web_link.html

**Contents:**
- Asset Preloading and Resource Hints with HTTP/2 and WebLink
- Installation
- Preloading Assets
  - How does it work?
- Resource Hints
- Parsing Link Headers

Symfony provides native support (via the WebLink component) for managing Link HTTP headers, which are the key to improve the application performance when using HTTP/2 and preloading capabilities of modern web browsers.

Link headers are used in HTTP/2 Server Push and W3C's Resource Hints to push resources (e.g. CSS and JavaScript files) to clients before they even know that they need them. WebLink also enables other optimizations that work with HTTP 1.x:

Something important to consider is that all these HTTP/2 features require a secure HTTPS connection, even when working on your local machine. The main web servers (Apache, nginx, Caddy, etc.) support this, but you can also use the Docker installer and runtime for Symfony created by Kévin Dunglas, from the Symfony community.

In applications using Symfony Flex, run the following command to install the WebLink feature before using it:

Imagine that your application includes a web page like this:

In a traditional HTTP workflow, when this page is loaded, browsers make one request for the HTML document and another for the linked CSS file. However, with HTTP/2, your application can send the CSS file's contents to the browser before it requests them.

To achieve this, update your template to use the preload() Twig function provided by WebLink. Note that the "as" attribute is required, as browsers use it to prioritize resources correctly and comply with the content security policy:

If you reload the page, the perceived performance will improve because the server responded with both the HTML page and the CSS file when the browser only requested the HTML page.

When using the AssetMapper component to link to assets (e.g. importmap('app')), there's no need to add the <link rel="preload"> tag. The importmap() Twig function automatically adds the Link HTTP header for you when the WebLink component is available.

You can preload an asset by wrapping it with the preload() function:

Additionally, according to the Priority Hints specification, you can signal the priority of the resource to download using the importance attribute:

The WebLink component manages the Link HTTP headers added to the response. When using the preload() function in the previous example, the following header was added to the response: Link </app.css>; rel="preload"; as="style" According to the Preload specification, when an HTTP/2 server detects that the original (HTTP 1.x) response contains this HTTP header, it will automatically trigger a push for the related file in the same HTTP/2 connection.

Popular proxy services and CDNs including Cloudflare, Fastly and Akamai also leverage this feature. It means that you can push resources to clients and improve performance of your applications in production right now.

If you want to prevent the push but let the browser preload the resource by issuing an early separate HTTP request, use the nopush option:

Resource Hints are used by applications to help browsers when deciding which resources should be downloaded, preprocessed or connected to first.

The WebLink component provides the following Twig functions to send those hints:

The component also supports sending HTTP links not related to performance and any link implementing the PSR-13 standard. For instance, any link defined in the HTML specification:

The previous snippet will result in this HTTP header being sent to the client: Link: </index.jsonld>; rel="alternate",</app.css>; rel="preload"; nopush

You can also add links to the HTTP response directly from controllers and services:

The possible values of link relations ('preload', 'preconnect', etc.) are also defined as constants in the Link class (e.g. Link::REL_PRELOAD, Link::REL_PRECONNECT, etc.).

Some third-party APIs provide resources such as pagination URLs using the Link HTTP header. The WebLink component provides the HttpHeaderParser utility class to parse those headers and transform them into Link instances:

The HttpHeaderParser class was introduced in Symfony 7.4.

Show your Sylius expertise

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/web-link
```

Example 2 (html):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Application</title>
    <link rel="stylesheet" href="/app.css">
</head>
<body>
    <main role="main" class="container">
        <!-- ... -->
    </main>
</body>
</html>
```

Example 3 (jsx):
```jsx
<head>
    <!-- ... -->
    {# note that you must add two <link> tags per asset:
       one to link to it and the other one to tell the browser to preload it #}
    <link rel="preload" href="{{ preload('/app.css', {as: 'style'}) }}" as="style">
    <link rel="stylesheet" href="/app.css">
</head>
```

Example 4 (jsx):
```jsx
<head>
    <!-- ... -->
    <link rel="preload" href="{{ preload(asset('build/app.css')) }}" as="style">
    <!-- ... -->
</head>
```

---
