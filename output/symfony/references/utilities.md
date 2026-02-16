# Symfony - Utilities

**Pages:** 7

---

## HTTP Client

**URL:** https://symfony.com/doc/7.4/http_client.html

**Contents:**
- HTTP Client
- Installation
- Basic Usage
- Configuration
  - Scoping Client
- Making Requests
  - Authentication
  - Query String Parameters
  - Headers
  - Uploading Data

The HttpClient component is a low-level HTTP client with support for both PHP stream wrappers and cURL. It provides utilities to consume APIs and supports synchronous and asynchronous operations. You can install it with:

Use the HttpClient class to make requests. In the Symfony framework, this class is available as the http_client service. This service will be autowired automatically when type-hinting for HttpClientInterface:

The HTTP client is interoperable with many common HTTP client abstractions in PHP. You can also use any of these abstractions to profit from autowirings. See Interoperability for more information.

The HTTP client contains many options you might need to take full control of the way the request is performed, including DNS pre-resolution, SSL parameters, public key pinning, etc. They can be defined globally in the configuration (to apply it to all requests) and to each request (which overrides any global configuration).

You can configure the global options using the default_options option:

You can also use the withOptions() method to retrieve a new instance of the client with new default options:

Alternatively, the HttpOptions class brings most of the available options with type-hinted getters and setters:

The setHeader() method was introduced in Symfony 7.1.

Some options are described in this guide:

Check out the full http_client config reference to learn about all the options.

The HTTP client also has a configuration option called max_host_connections. This option cannot be overridden per request:

It's common that some of the HTTP client options depend on the URL of the request (e.g. you must set some headers when making requests to GitHub API but not for other hosts). If that's your case, the component provides scoped clients (using ScopingHttpClient) to autoconfigure the HTTP client based on the requested URL:

You can define several scopes, so that each set of options is added only if a requested URL matches one of the regular expressions set by the scope option.

The options passed to the request() method are merged with the default options defined in the scoped client. The options passed to request() take precedence and override or extend the default ones.

If you use scoped clients in the Symfony framework, you must use any of the methods defined by Symfony to choose a specific service. Each client has a unique service named after its configuration.

Each scoped client also defines a corresponding named autowiring alias. If you use for example Symfony\Contracts\HttpClient\HttpClientInterface $githubClient as the type and name of an argument, autowiring will inject the github.client service into your autowired classes.

Read the base_uri option docs to learn the rules applied when merging relative URIs into the base URI of the scoped client.

The HTTP client provides a single request() method to perform all kinds of HTTP requests:

Symfony's HTTP client is asynchronous by default. When you call request(), the HTTP request starts immediately, but the method returns without waiting for a response. Your code only blocks when you actually need the response data:

The HTTP client also supports concurrent requests to make multiple HTTP requests in parallel, and streaming responses to process response data in chunks for fully asynchronous applications.

The HTTP client supports different authentication mechanisms. They can be defined globally in the configuration (to apply it to all requests) and to each request (which overrides any global authentication):

Basic Authentication can also be set by including the credentials in the URL, such as: http://the-username:the-password@example.com

The NTLM authentication mechanism requires using the cURL transport. By using HttpClient::createForBaseUri(), we ensure that the auth credentials won't be sent to any other hosts than https://example.com/.

You can either append them manually to the requested URL, or define them as an associative array via the query option, that will be merged with the URL:

Use the headers option to define the default headers added to all requests:

You can also set new headers or override the default ones for specific requests:

This component provides several methods for uploading data using the body option. You can use regular strings, closures, iterables and resources and they'll be processed automatically when making the requests:

When uploading data with the POST method, if you don't define the Content-Type HTTP header explicitly, Symfony assumes that you're uploading form data and adds the required 'Content-Type: application/x-www-form-urlencoded' header for you.

When the body option is set as a closure, it will be called several times until it returns the empty string, which signals the end of the body. Each time, the closure should return a string smaller than the amount requested as argument.

A generator or any Traversable can also be used instead of a closure.

When uploading JSON payloads, use the json option instead of body. The given content will be JSON-encoded automatically and the request will add the Content-Type: application/json automatically too:

To submit a form with file uploads, pass the file handle to the body option:

By default, this code will populate the filename and content-type with the data of the opened file, but you can configure both with the PHP streaming configuration:

When using multidimensional arrays the FormDataPart class automatically appends [key] to the name of the field:

This behavior can be bypassed by using the following array structure:

The Content-Type of each form's part is detected automatically. However, you can override it by passing a DataPart:

By default, HttpClient streams the body contents when uploading them. This might not work with all servers, resulting in HTTP status code 411 ("Length Required") because there is no Content-Length header. The solution is to turn the body into a string with the following method (which will increase memory consumption when the streams are large):

If you need to add a custom HTTP header to the upload, you can do:

The HTTP client provided by this component is stateless but handling cookies requires a stateful storage (because responses can update cookies and they must be used for subsequent requests). That's why this component doesn't handle cookies automatically.

You can either send cookies with the BrowserKit component, which integrates seamlessly with the HttpClient component, or manually setting the Cookie HTTP request header as follows:

By default, the HTTP client follows redirects, up to a maximum of 20, when making a request. Use the max_redirects setting to configure this behavior (if the number of redirects is higher than the configured value, you'll get a RedirectionException):

Sometimes, requests fail because of network issues or temporary server errors. Symfony's HttpClient allows retrying failed requests automatically using the retry_failed option.

By default, failed requests are retried up to 3 times, with an exponential delay between retries (first retry = 1 second; third retry: 4 seconds) and only for the following HTTP status codes: 423, 425, 429, 502 and 503 when using any HTTP method and 500, 504, 507 and 510 when using an HTTP idempotent method. Use the max_retries setting to configure the amount of times a request is retried.

Check out the full list of configurable retry_failed options to learn how to tweak each of them to fit your application needs.

When using the HttpClient outside of a Symfony application, use the RetryableHttpClient class to wrap your original HTTP client:

The RetryableHttpClient uses a RetryStrategyInterface to decide if the request should be retried, and to define the waiting time between each retry.

The RetryableHttpClient can be configured to use multiple base URIs. This feature provides increased flexibility and reliability for making HTTP requests. Pass an array of base URIs as option base_uri when making a request:

When the number of retries is higher than the number of base URIs, the last base URI will be used for the remaining retries.

If you want to shuffle the order of base URIs for each retry attempt, nest the base URIs you want to shuffle in an additional array:

This feature allows for a more randomized approach to handling retries, reducing the likelihood of repeatedly hitting the same failed base URI.

By using a nested array for the base URI, you can use this feature to distribute the load among many nodes in a cluster of servers.

You can also configure the array of base URIs using the withOptions() method:

By default, this component honors the standard environment variables that your Operating System defines to direct the HTTP traffic through your local proxy. This means there is usually nothing to configure to have the client work with proxies, provided these env vars are properly configured.

You can still set or override these settings using the proxy and no_proxy options:

By providing a callable to the on_progress option, one can track uploads/downloads as they complete. This callback is guaranteed to be called on DNS resolution, on arrival of headers and on completion; additionally it is called when new data is uploaded or downloaded and at least once per second:

Any exceptions thrown from the callback will be wrapped in an instance of TransportExceptionInterface and will abort the request.

HttpClient uses the system's certificate store to validate SSL certificates (while browsers use their own stores). When using self-signed certificates during development, it's recommended to create your own certificate authority (CA) and add it to your system's store.

Alternatively, you can also disable verify_host and verify_peer (see http_client config reference), but this is not recommended in production.

SSRF allows an attacker to induce the backend application to make HTTP requests to an arbitrary domain. These attacks can also target the internal hosts and IPs of the attacked server.

If you use an HttpClient together with user-provided URIs, it is probably a good idea to decorate it with a NoPrivateNetworkHttpClient. This will ensure local networks are made inaccessible to the HTTP client:

When you are using the TraceableHttpClient, responses content will be kept in memory and may exhaust it.

You can disable this behavior by setting the extra.trace_content option to false in your requests:

This setting won't affect other clients.

The UriTemplateHttpClient provides a client that eases the use of URI templates, as described in the RFC 6570:

Before using URI templates in your applications, you must install a third-party package that expands those URI templates to turn them into URLs:

When using this client in the framework context, all existing HTTP clients are decorated by the UriTemplateHttpClient. This means that URI template feature is enabled by default for all HTTP clients you may use in your application.

You can configure variables that will be replaced globally in all URI templates of your application:

If you want to define your own logic to handle variables of URI templates, you can do so by redefining the http_client.uri_template_expander alias. Your service must be invokable.

The component is built for maximum HTTP performance. By design, it is compatible with HTTP/2 and with doing concurrent asynchronous streamed and multiplexed requests/responses. Even when doing regular synchronous calls, this design allows keeping connections to remote hosts open between requests, improving performance by saving repetitive DNS resolution, SSL negotiation, etc. To leverage all these design benefits, the cURL extension is needed.

This component can make HTTP requests using native PHP streams and the amphp/http-client and cURL libraries. Although they are interchangeable and provide the same features, including concurrent requests, HTTP/2 is only supported when using cURL or amphp/http-client.

To use the AmpHttpClient, the amphp/http-client package must be installed.

The create() method selects the cURL transport if the cURL PHP extension is enabled. It falls back to AmpHttpClient if cURL couldn't be found or is too old. Finally, if AmpHttpClient is not available, it falls back to PHP streams. If you prefer to select the transport explicitly, use the following classes to create the client:

When using this component in a full-stack Symfony application, this behavior is not configurable and cURL will be used automatically if the cURL PHP extension is installed and enabled, and will fall back as explained above.

PHP allows configuring lots of cURL options via the curl_setopt function. In order to make the component more portable when not using cURL, the CurlHttpClient only uses some of those options (and they are ignored in the rest of clients).

Add an extra.curl option in your configuration to pass those extra options:

Some cURL options are impossible to override (e.g. because of thread safety) and you'll get an exception when trying to override them.

The HTTP header Accept-Encoding: gzip is added automatically if:

If the server does respond with a gzipped response, it's decoded transparently. To disable HTTP compression, send an Accept-Encoding: identity HTTP header.

Chunked transfer encoding is enabled automatically if both your PHP runtime and the remote server support it.

If you set Accept-Encoding to e.g. gzip, you will need to handle the decompression yourself.

When requesting an https URL, HTTP/2 is enabled by default if one of the following tools is installed:

To force HTTP/2 for http URLs, you need to enable it explicitly via the http_version option:

Support for HTTP/2 PUSH works automatically when using a compatible client: pushed responses are put into a temporary cache and are used when a subsequent request is triggered for the corresponding URLs.

The response returned by all HTTP clients is an object of type ResponseInterface which provides the following methods:

$response->toStream() is part of StreamableInterface.

$response->getInfo() is non-blocking: it returns live information about the response. Some of them might not be known yet (e.g. http_code) when you'll call it.

Call the stream() method to get chunks of the response sequentially instead of waiting for the entire response:

By default, text/*, JSON and XML response bodies are buffered in a local php://temp stream. You can control this behavior by using the buffer option: set it to true/false to enable/disable buffering, or to a closure that should return the same based on the response headers it receives as an argument.

To abort a request (e.g. because it didn't complete in due time, or you want to fetch only the first bytes of the response, etc.), you can either use the cancel():

Or throw an exception from a progress callback:

The exception will be wrapped in an instance of TransportExceptionInterface and will abort the request.

In case the response was canceled using $response->cancel(), $response->getInfo('canceled') will return true.

There are three types of exceptions, all of which implement the ExceptionInterface:

When the HTTP status code of the response is in the 300-599 range (i.e. 3xx, 4xx or 5xx), the getHeaders(), getContent() and toArray() methods throw an appropriate exception, all of which implement the HttpExceptionInterface.

To opt-out from this exception and deal with 300-599 status codes on your own, pass false as the optional argument to every call of those methods, e.g. $response->getHeaders(false);.

If you do not call any of these 3 methods at all, the exception will still be thrown when the $response object is destructed.

Calling $response->getStatusCode() is enough to disable this behavior (but then don't miss checking the status code yourself).

While responses are lazy, their destructor will always wait for headers to come back. This means that the following request will complete; and if e.g. a 404 is returned, an exception will be thrown:

This in turn means that unassigned responses will fallback to synchronous requests. If you want to make these requests concurrent, you can store their corresponding responses in an array:

This behavior provided at destruction-time is part of the fail-safe design of the component. No errors will be unnoticed: if you don't write the code to handle errors, exceptions will notify you when needed. On the other hand, if you write the error-handling code (by calling $response->getStatusCode()), you will opt-out from these fallback mechanisms as the destructor won't have anything remaining to do.

Symfony's HTTP client makes asynchronous HTTP requests by default. This means you don't need to configure anything special to send multiple requests in parallel and process them efficiently.

Here's a practical example that fetches metadata about several Symfony components from the Packagist API in parallel:

As you can see, the requests are sent in the first loop, but their responses aren't consumed until the second one. This is the key to achieving parallel and concurrent execution: dispatch all requests first, and read them later. This allows the client to handle all pending responses efficiently while your code waits only when necessary.

The maximum number of concurrent requests depends on your system's resources (e.g. the operating system might limit the number of simultaneous connections or access to certificate files). To avoid hitting these limits, consider processing requests in batches.

There is, however, a maximum amount of concurrent connections that can be open per host (6 by default). See max_host_connections.

In the previous example, responses are read in the same order as the requests were sent. However, it's possible that, for instance, the second response arrives before the first. To handle such cases efficiently, you need fully asynchronous processing, which allows responses to be handled in whatever order they arrive.

To achieve this, the stream() method can be used to monitor a list of responses. As mentioned previously, this method yields response chunks as soon as they arrive over the network. Replacing the standard foreach loop with the following version enables true asynchronous behavior:

Use the user_data option along with $response->getInfo('user_data') to identify each response during streaming.

This component allows dealing with both request and response timeouts.

A timeout can happen when e.g. DNS resolution takes too much time, when the TCP connection cannot be opened in the given time budget, or when the response content pauses for too long. This can be configured with the timeout request option:

The default_socket_timeout PHP ini setting is used if the option is not set.

The option can be overridden by using the 2nd argument of the stream() method. This allows monitoring several responses at once and applying the timeout to all of them in a group. If all responses become inactive for the given duration, the method will yield a special chunk whose isTimeout() will return true:

A timeout is not necessarily an error: you can decide to stream again the response and get remaining contents that might come back in a new timeout, etc.

Passing 0 as timeout allows monitoring responses in a non-blocking way.

Timeouts control how long one is willing to wait while the HTTP transaction is idle. Big responses can last as long as needed to complete, provided they remain active during the transfer and never pause for longer than specified.

Use the max_duration option to limit the time a full request/response can last.

Network errors (broken pipe, failed DNS resolution, etc.) are thrown as instances of TransportExceptionInterface.

First of all, you don't have to deal with them: letting errors bubble to your generic exception-handling stack might be really fine in most use cases.

If you want to handle them, here is what you need to know:

To catch errors, you need to wrap calls to $client->request() but also calls to any methods of the returned responses. This is because responses are lazy, so that network errors can happen when calling e.g. getStatusCode() too:

Because $response->getInfo() is non-blocking, it shouldn't throw by design.

When multiplexing responses, you can deal with errors for individual streams by catching TransportExceptionInterface in the foreach loop:

This component provides a CachingHttpClient decorator that enables caching of HTTP responses and serving them from cache storage on subsequent requests, as described in RFC 9111.

Internally, it relies on a tag aware cache, so the Cache component must be installed in your application.

The caching mechanism is asynchronous. The response must be fully consumed (for example, by calling getContent() or using a stream) for it to be stored in the cache.

It is strongly recommended to configure a retry strategy to gracefully handle temporary cache inconsistencies or validation failures.

In Symfony 7.4, caching was refactored to comply with RFC 9111 and to leverage the Cache component. In previous versions, it relied on HttpCache from the HttpKernel component.

This component provides a ThrottlingHttpClient decorator that allows you to limit the number of requests within a certain period, potentially delaying calls based on the rate limiting policy.

The implementation leverages the LimiterInterface class under the hood so the Rate Limiter component needs to be installed in your application:

The ThrottlingHttpClient was introduced in Symfony 7.1.

Server-sent events is an Internet standard used to push data to web pages. Its JavaScript API is built around an EventSource object, which listens to the events sent from some URL. The events are a stream of data (served with the text/event-stream MIME type) with the following format:

Symfony's HTTP client provides an EventSource implementation to consume these server-sent events. Use the EventSourceHttpClient to wrap your HTTP client, open a connection to a server that responds with a text/event-stream content type and consume the stream as follows:

If you know that the content of the ServerSentEvent is in the JSON format, you can use the getArrayData() method to directly get the decoded JSON as array.

The component is interoperable with four different abstractions for HTTP clients: Symfony Contracts, PSR-18, HTTPlug v1/v2 and native PHP streams. If your application uses libraries that need any of them, the component is compatible with all of them. They also benefit from autowiring aliases when the framework bundle is used.

If you are writing or maintaining a library that makes HTTP requests, you can decouple it from any specific HTTP client implementations by coding against either Symfony Contracts (recommended), PSR-18 or HTTPlug v2.

The interfaces found in the symfony/http-client-contracts package define the primary abstractions implemented by the component. Its entry point is the HttpClientInterface. That's the interface you need to code against when a client is needed:

All request options mentioned above (e.g. timeout management) are also defined in the wordings of the interface, so that any compliant implementations (like this component) is guaranteed to provide them. That's a major difference with the other abstractions, which provide none related to the transport itself.

Another major feature covered by the Symfony Contracts is async/multiplexing, as described in the previous sections.

This component implements the PSR-18 (HTTP Client) specifications via the Psr18Client class, which is an adapter to turn a Symfony HttpClientInterface into a PSR-18 ClientInterface. This class also implements the relevant methods of PSR-17 to ease creating request objects.

To use it, you need the psr/http-client package and a PSR-17 implementation:

Now you can make HTTP requests with the PSR-18 client as follows:

You can also pass a set of default options to your client thanks to the Psr18Client::withOptions() method:

You can use the auto_upgrade_http_version option to control whether the HTTP protocol version is automatically upgraded:

The auto_upgrade_http_version option is ignored for HTTP/1.0 requests, which always keep that protocol version.

The auto_upgrade_http_version option was introduced in Symfony 7.4.

The HTTPlug v1 specification was published before PSR-18 and is superseded by it. As such, you should not use it in newly written code. The component is still interoperable with libraries that require it thanks to the HttplugClient class. Similarly to Psr18Client implementing relevant parts of PSR-17, HttplugClient also implements the factory methods defined in the related php-http/message-factory package.

Let's say you want to instantiate a class with the following constructor, that requires HTTPlug dependencies:

Because HttplugClient implements these interfaces,you can use it this way:

If you'd like to work with promises, HttplugClient also implements the HttpAsyncClient interface. To use it, you need to install the guzzlehttp/promises package:

Then you're ready to go:

You can also pass a set of default options to your client thanks to the HttplugClient::withOptions() method:

See the auto_upgrade_http_version option for details about how the HTTP protocol version selection works.

Responses implementing ResponseInterface can be cast to native PHP streams with createResource(). This allows using them where native PHP streams are needed:

If you want to extend the behavior of a base HTTP client, you can use service decoration:

A decorator like this one is useful in cases where processing the requests' arguments is enough. By decorating the on_progress option, you can even implement basic monitoring of the response. However, since calling responses' methods forces synchronous operations, doing so inside request() will break async.

The solution is to also decorate the response object itself. TraceableHttpClient and TraceableResponse are good examples as a starting point.

In order to help writing more advanced response processors, the component provides an AsyncDecoratorTrait. This trait allows processing the stream of chunks as they come back from the network:

Because the trait already implements a constructor and the stream() method, you don't need to add them. The request() method should still be defined; it shall return an AsyncResponse.

The custom processing of chunks should happen in $passthru: this generator is where you need to write your logic. It will be called for each chunk yielded by the underlying client. A $passthru that does nothing would just yield $chunk;. You could also yield a modified chunk, split the chunk into many ones by yielding several times, or even skip a chunk altogether by issuing a return; instead of yielding.

In order to control the stream, the chunk passthru receives an AsyncContext as second argument. This context object has methods to read the current state of the response. It also allows altering the response stream with methods to create new chunks of content, pause the stream, cancel the stream, change the info of the response, replace the current request by another one or change the chunk passthru itself.

Checking the test cases implemented in AsyncDecoratorTraitTest might be a good start to get various working examples for a better understanding. Here are the use cases that it simulates:

The logic in AsyncResponse has many safety checks that will throw a LogicException if the chunk passthru doesn't behave correctly; e.g. if a chunk is yielded after an isLast() one, or if a content chunk is yielded before an isFirst() one, etc.

This component includes the MockHttpClient and MockResponse classes to use in tests that shouldn't make actual HTTP requests. Such tests can be useful, as they will run faster and produce consistent results, since they're not dependent on an external service. By not making actual HTTP requests there is no need to worry about the service being online or the request changing state, for example deleting a resource.

MockHttpClient implements the HttpClientInterface, just like any actual HTTP client in this component. When you type-hint with HttpClientInterface your code will accept the real client outside tests, while replacing it with MockHttpClient in the test.

When the request method is used on MockHttpClient, it will respond with the supplied MockResponse. There are a few ways to use it, as described below.

The first way of using MockHttpClient is to pass a list of responses to its constructor. These will be yielded in order when requests are made:

It is also possible to create a MockResponse directly from a file, which is particularly useful when storing your response snapshots in files:

The fromFile() method was introduced in Symfony 7.1.

Another way of using MockHttpClient is to pass a callback that generates the responses dynamically when it's called:

You can also pass a list of callbacks if you need to perform specific assertions on the request before returning the mocked response:

Instead of using the first argument, you can also set the (list of) responses or callbacks using the setResponseFactory() method:

If you need to test responses with HTTP status codes different than 200, define the http_code option:

The responses provided to the mock client don't have to be instances of MockResponse. Any class implementing ResponseInterface will work (e.g. $this->createMock(ResponseInterface::class)).

However, using MockResponse allows simulating chunked responses and timeouts:

Finally, you can also create an invokable or iterable class that generates the responses and use it as a callback in functional tests:

Then configure Symfony to use your callback:

To return json, you would normally do:

You can use JsonMockResponse instead:

Just like MockResponse, you can also create a JsonMockResponse directly from a file:

The fromFile() method was introduced in Symfony 7.1.

The MockResponse class comes with some helper methods to test the request:

The following standalone example demonstrates a way to use the HTTP client and test it in a real application:

Modern browsers (via their network tab) and HTTP clients allow you to export the information of one or more HTTP requests using the HAR (HTTP Archive) format. You can use those .har files to perform tests with Symfony's HTTP Client.

First, use a browser or HTTP client to perform the HTTP request(s) you want to test. Then, save that information as a .har file somewhere in your application:

If your service performs multiple requests or if your .har file contains multiple request/response pairs, the HarFileResponseFactory will find the associated response based on the request method, URL and body (if any). Note that this won't work if the request body or URI is random / always changing (e.g. if it contains current date or random UUIDs).

As explained in the Network Errors section, when making HTTP requests you might face errors at transport level.

That's why it's useful to test how your application behaves in case of a transport error. MockResponse allows you to do so in multiple ways.

In order to test errors that occur before headers have been received, set the error option value when creating the MockResponse. Transport errors of this kind occur, for example, when a host name cannot be resolved or the host was unreachable. The TransportException will be thrown as soon as a method like getStatusCode() or getHeaders() is called.

In order to test errors that occur while a response is being streamed (that is, after the headers have already been received), provide the exception to MockResponse as part of the body parameter. You can either use an exception directly, or yield the exception from a callback. For exceptions of this kind, getStatusCode() may indicate a success (200), but accessing getContent() fails.

The following example code illustrates all three options.

Online exam, become Sylius certified today

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/http-client
```

Example 2 (php):
```php
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SymfonyDocs
{
    public function __construct(
        private HttpClientInterface $client,
    ) {
    }

    public function fetchGitHubInformation(): array
    {
        $response = $this->client->request(
            'GET',
            'https://api.github.com/repos/symfony/symfony-docs'
        );

        $statusCode = $response->getStatusCode();
        // $statusCode = 200
        $contentType = $response->getHeaders()['content-type'][0];
        // $contentType = 'application/json'
        $content = $response->getContent();
        // $content = '{"id":521583, "name":"symfony-docs", ...}'
        $content = $response->toArray();
        // $content = ['id' => 521583, 'name' => 'symfony-docs', ...]

        return $content;
    }
}
```

Example 3 (php):
```php
use Symfony\Component\HttpClient\HttpClient;

$client = HttpClient::create();
$response = $client->request(
    'GET',
    'https://api.github.com/repos/symfony/symfony-docs'
);

$statusCode = $response->getStatusCode();
// $statusCode = 200
$contentType = $response->getHeaders()['content-type'][0];
// $contentType = 'application/json'
$content = $response->getContent();
// $content = '{"id":521583, "name":"symfony-docs", ...}'
$content = $response->toArray();
// $content = ['id' => 521583, 'name' => 'symfony-docs', ...]
```

Example 4 (yaml):
```yaml
# config/packages/framework.yaml
framework:
    http_client:
        default_options:
            max_redirects: 7
```

---

## The ExpressionLanguage Component

**URL:** https://symfony.com/doc/7.4/components/expression_language.html

**Contents:**
- The ExpressionLanguage Component
- Installation
- How can the Expression Language Help Me?
- Usage
  - Null Coalescing Operator
  - Parsing and Linting Expressions
- Passing in Variables
- Caching
    - The Workflow
    - Using Parsed and Serialized Expressions

The ExpressionLanguage component provides an engine that can compile and evaluate expressions. An expression is a one-liner that returns a value (mostly, but not limited to, Booleans).

If you install this component outside of a Symfony application, you must require the vendor/autoload.php file in your code to enable the class autoloading mechanism provided by Composer. Read this article for more details.

The purpose of the component is to allow users to use expressions inside configuration for more complex logic. For example, the Symfony Framework uses expressions in security, for validation rules and in route matching.

Besides using the component in the framework itself, the ExpressionLanguage component is a perfect candidate for the foundation of a business rule engine. The idea is to let the webmaster of a website configure things in a dynamic way without using PHP and without introducing security problems:

Expressions can be seen as a very restricted PHP sandbox and are less vulnerable to external injections because you must explicitly declare which variables are available in an expression (but you should still sanitize any data given by end users and passed to expressions).

The ExpressionLanguage component can compile and evaluate expressions. Expressions are one-liners that often return a Boolean, which can be used by the code executing the expression in an if statement. A simple example of an expression is 1 + 2. You can also use more complicated expressions, such as someArray[3].someMethod('bar').

The component provides 2 ways to work with expressions:

The main class of the component is ExpressionLanguage:

See The Expression Syntax to learn the syntax of the ExpressionLanguage component.

This content has been moved to the null coalescing operator section of ExpressionLanguage syntax reference page.

The ExpressionLanguage component provides a way to parse and lint expressions. The parse() method returns a ParsedExpression instance that can be used to inspect and manipulate the expression. The lint(), on the other hand, throws a SyntaxError if the expression is not valid:

The behavior of these methods can be configured with some flags defined in the Parser class:

This is how you can use these flags:

The support for flags in the parse() and lint() methods was introduced in Symfony 7.1.

You can also pass variables into the expression, which can be of any valid PHP type (including objects):

When using this component inside a Symfony application, certain objects and variables are automatically injected by Symfony so you can use them in your expressions (e.g. the request, the current user, etc.):

The ExpressionLanguage component provides a compile() method to be able to cache the expressions in plain PHP. But internally, the component also caches the parsed expressions, so duplicated expressions can be compiled/evaluated quicker.

Both evaluate() and compile() need to do some things before each can provide the return values. For evaluate(), this overhead is even bigger.

Both methods need to tokenize and parse the expression. This is done by the parse() method. It returns a ParsedExpression. Now, the compile() method just returns the string conversion of this object. The evaluate() method needs to loop through the "nodes" (pieces of an expression saved in the ParsedExpression) and evaluate them dynamically.

To save time, the ExpressionLanguage caches the ParsedExpression so it can skip the tokenization and parsing steps with duplicate expressions. The caching is done by a PSR-6 CacheItemPoolInterface instance (by default, it uses an ArrayAdapter). You can customize this by creating a custom cache pool or using one of the available ones and injecting this using the constructor:

See the The Cache Component documentation for more information about available cache adapters.

Both evaluate() and compile() can handle ParsedExpression and SerializedParsedExpression:

It's difficult to manipulate or inspect the expressions created with the ExpressionLanguage component, because the expressions are plain strings. A better approach is to turn those expressions into an AST. In computer science, AST (Abstract Syntax Tree) is "a tree representation of the structure of source code written in a programming language". In Symfony, an ExpressionLanguage AST is a set of nodes that contain PHP classes representing the given expression.

Call the getNodes() method after parsing any expression to get its AST:

The nodes of the AST can also be dumped into a PHP array of nodes to allow manipulating them. Call the toArray() method to turn the AST into an array:

The ExpressionLanguage can be extended by adding custom functions. For instance, in the Symfony Framework, the security has custom functions to check the user's role.

If you want to learn how to use functions in an expression, read "The Expression Syntax".

Functions are registered on each specific ExpressionLanguage instance. That means the functions can be used in any expression executed by that instance.

To register a function, use register(). This method has 3 arguments:

In addition to the custom function arguments, the evaluator is passed an arguments variable as its first argument, which is equal to the second argument of evaluate() (e.g. the "values" when evaluating an expression).

When you use the ExpressionLanguage class in your library, you often want to add custom functions. To do so, you can create a new expression provider by creating a class that implements ExpressionFunctionProviderInterface.

This interface requires one method: getFunctions(), which returns an array of expression functions (instances of ExpressionFunction) to register:

To create an expression function from a PHP function with the fromPhp() static method:

Namespaced functions are supported, but they require a second argument to define the name of the expression:

You can register providers using registerProvider() or by using the second argument of the constructor:

It is recommended to create your own ExpressionLanguage class in your library. Now you can add the extension by overriding the constructor:

Take the exam at home

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/expression-language
```

Example 2 (markdown):
```markdown
# Get the special price if
user.getGroup() in ['good_customers', 'collaborator']

# Promote article to the homepage when
article.commentCount > 100 and article.category not in ["misc"]

# Send an alert when
product.stock < 15
```

Example 3 (php):
```php
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

$expressionLanguage = new ExpressionLanguage();

var_dump($expressionLanguage->evaluate('1 + 2')); // displays 3

var_dump($expressionLanguage->compile('1 + 2')); // displays (1 + 2)
```

Example 4 (php):
```php
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

$expressionLanguage = new ExpressionLanguage();

var_dump($expressionLanguage->parse('1 + 2', []));
// displays the AST nodes of the expression which can be
// inspected and manipulated

$expressionLanguage->lint('1 + 2', []); // doesn't throw anything

$expressionLanguage->lint('1 + a', []);
// throws a SyntaxError exception:
// "Variable "a" is not valid around position 5 for expression `1 + a`."
```

---

## The Expression Syntax

**URL:** https://symfony.com/doc/7.4/reference/formats/expression_language.html

**Contents:**
- The Expression Syntax
- Supported Literals
- Working with Objects
  - Accessing Public Properties
  - Calling Methods
    - Null-safe Operator
    - Null-Coalescing Operator
- Working with Functions
  - constant() function
  - enum() function

The ExpressionLanguage component uses a specific syntax which is based on the expression syntax of Twig. In this document, you can find all supported syntaxes.

The component supports:

The support for comments inside expressions was introduced in Symfony 7.2.

A backslash (\) must be escaped by 3 backslashes (\\\\) in a string and 7 backslashes (\\\\\\\\) in a regex:

Control characters (e.g. \n) in expressions are replaced with whitespace. To avoid this, escape the sequence with a single backslash (e.g. \\n).

When passing objects into an expression, you can use different syntaxes to access properties and call methods on the object.

Public properties on objects can be accessed by using the . syntax, similar to JavaScript:

This will print out Honeycrisp.

The . syntax can also be used to call methods on an object, similar to JavaScript:

This will print out Hi Hi Hi!.

Use the ?. syntax to access properties and methods of objects that can be null (this is equivalent to the $object?->propertyOrMethod PHP null-safe operator):

It returns the left-hand side if it exists and it's not null; otherwise it returns the right-hand side. Expressions can chain multiple coalescing operators:

Starting from Symfony 7.2, no exception is thrown when trying to access a non-existent variable. This is the same behavior as the null-coalescing operator in PHP.

You can also use registered functions in the expression by using the same syntax as PHP and JavaScript. The ExpressionLanguage component comes with the following functions by default:

This function will return the value of a PHP constant:

This will print out root.

This also works with class constants:

This will print out /api.

This function will return the case of an enumeration:

This will print out true.

This function will return the lowest value of the given parameters. You can pass different types of parameters (e.g. dates, strings, numeric values) and even mix them (e.g. pass numeric values and strings). Internally it uses the min PHP function to find the lowest value:

This will print out 1.

This function will return the highest value of the given parameters. You can pass different types of parameters (e.g. dates, strings, numeric values) and even mix them (e.g. pass numeric values and strings). Internally it uses the max PHP function to find the highest value:

This will print out 3.

The min() and max() functions were introduced in Symfony 7.1.

To read how to register your own functions to use in an expression, see "The ExpressionLanguage Component".

If you pass an array into an expression, use the [] syntax to access array keys, similar to JavaScript:

This will print out 42.

The component comes with a lot of operators:

This will print out 42.

Support for the ~, << and >> bitwise operators was introduced in Symfony 7.2.

To test if a string does not match a regex, use the logical not operator in combination with the matches operator:

You must use parentheses because the unary operator not has precedence over the binary operator matches.

Both variables would be set to false.

Support for the xor logical operator was introduced in Symfony 7.2.

This $ret variable will be set to true.

This would print out Arthur Dent.

These operators are using strict comparison. For example:

The $inGroup would evaluate to true.

The in and not in operators are using strict comparison.

This will evaluate to true, because user.age is in the range from 18 to 45.

Operator precedence determines the order in which operations are processed in an expression. For example, the result of the expression 1 + 2 * 4 is 9 and not 12 because the multiplication operator (*) takes precedence over the addition operator (+).

To avoid ambiguities (or to alter the default order of operations) add parentheses in your expressions (e.g. (1 + 2) * 4 or 1 + (2 * 4).

The following table summarizes the operators and their associativity from the highest to the lowest precedence:

When using this component inside a Symfony application, certain objects and variables are automatically injected by Symfony so you can use them in your expressions (e.g. the request, the current user, etc.):

Code consumes server resources. Blackfire tells you how

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (bash):
```bash
echo $expressionLanguage->evaluate('"\\\\"'); // prints \
$expressionLanguage->evaluate('"a\\\\b" matches "/^a\\\\\\\\b$/"'); // returns true
```

Example 2 (php):
```php
class Apple
{
    public string $variety;
}

$apple = new Apple();
$apple->variety = 'Honeycrisp';

var_dump($expressionLanguage->evaluate(
    'fruit.variety',
    [
        'fruit' => $apple,
    ]
));
```

Example 3 (php):
```php
class Robot
{
    public function sayHi(int $times): string
    {
        $greetings = [];
        for ($i = 0; $i < $times; $i++) {
            $greetings[] = 'Hi';
        }

        return implode(' ', $greetings).'!';
    }
}

$robot = new Robot();

var_dump($expressionLanguage->evaluate(
    'robot.sayHi(3)',
    [
        'robot' => $robot,
    ]
));
```

Example 4 (swift):
```swift
// these will throw an exception when `fruit` is `null`
$expressionLanguage->evaluate('fruit.color', ['fruit' => '...'])
$expressionLanguage->evaluate('fruit.getStock()', ['fruit' => '...'])

// these will return `null` if `fruit` is `null`
$expressionLanguage->evaluate('fruit?.color', ['fruit' => '...'])
$expressionLanguage->evaluate('fruit?.getStock()', ['fruit' => '...'])
```

---

## How to Inject Values Based on Complex Expressions

**URL:** https://symfony.com/doc/7.4/service_container/expression_language.html

**Contents:**
- How to Inject Values Based on Complex Expressions

The service container also supports an "expression" that allows you to inject very specific values into a service.

For example, suppose you have a service (not shown here), called App\Mail\MailerConfiguration, which has a getMailerMethod() method on it. This returns a string - like sendmail based on some configuration.

Suppose that you want to pass the result of this method as a constructor argument to another service: App\Mailer. One way to do this is with an expression:

Learn more about the expression language syntax.

In this context, you have access to 3 functions:

You also have access to the Container via a container variable. Here's another example:

Expressions can be used in arguments, properties, as arguments with configurator, as arguments to calls (method calls) and in factories (service factories).

Measure & Improve Symfony Code Performance

Get your Sylius expertise recognized

**Examples:**

Example 1 (yaml):
```yaml
# config/services.yaml
services:
    # ...

    App\Mail\MailerConfiguration: ~

    App\Mailer:
        # the '@=' prefix is required when using expressions for arguments in YAML files
        arguments: ['@=service("App\\Mail\\MailerConfiguration").getMailerMethod()']
        # when using double-quoted strings, the backslash needs to be escaped twice (see https://yaml.org/spec/1.2/spec.html#id2787109)
        # arguments: ["@=service('App\\\\Mail\\\\MailerConfiguration').getMailerMethod()"]
```

Example 2 (xml):
```xml
<!-- config/services.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <!-- ... -->

        <service id="App\Mail\MailerConfiguration"></service>

        <service id="App\Mailer">
            <argument type="expression">service('App\\Mail\\MailerConfiguration').getMailerMethod()</argument>
        </service>
    </services>
</container>
```

Example 3 (php):
```php
// config/services.php
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

use App\Mail\MailerConfiguration;
use App\Mailer;

return function(ContainerConfigurator $container): void {
    // ...

    $services->set(MailerConfiguration::class);

    $services->set(Mailer::class)
        // because of the escaping applied by PHP, you must add 4 backslashes for each original backslash
        ->args([expr("service('App\\\\Mail\\\\MailerConfiguration').getMailerMethod()")]);
};
```

Example 4 (yaml):
```yaml
# config/services.yaml
services:
    App\Mailer:
        # the '@=' prefix is required when using expressions for arguments in YAML files
        arguments: ["@=container.hasParameter('some_param') ? parameter('some_param') : 'default_value'"]
```

---

## Dealing with Concurrency with Locks

**URL:** https://symfony.com/doc/7.4/lock.html

**Contents:**
- Dealing with Concurrency with Locks
- Installing
- Configuring
- Locking a Resource
- Locking a Dynamic Resource
- Naming Locks

When a program runs concurrently, some parts of code that modify shared resources should not be accessed by multiple processes at the same time. Symfony's Lock component provides a locking mechanism to ensure that only one process is running the critical section of code at any point of time to prevent race conditions from happening.

The following example shows a typical usage of the lock:

In applications using Symfony Flex, run this command to install the Lock component:

By default, Symfony provides a Semaphore when available, or a Flock otherwise. You can configure this behavior by using the lock key like:

The option to use an existing service as the lock/semaphore was introduced in Symfony 7.2.

To lock the default resource, autowire the lock factory using LockFactory:

The same instance of LockInterface won't block when calling acquire multiple times inside the same process. When several services use the same lock, inject the LockFactory instead to create a separate lock instance for each service.

Sometimes the application is able to cut the resource into small pieces in order to lock a small subset of processes and let others through. The previous example showed how to lock the $pdf->getOrCreatePdf() call for everybody, now let's see how to lock a $pdf->getOrCreatePdf($version) call only for processes asking for the same $version:

If the application needs different kinds of stores alongside each other, Symfony provides named lock:

After having configured one or more named locks, you have two ways of injecting them in any service or controller:

(1) Use a specific argument name

Type-hint your constructor/method argument with LockFactory and name the argument using this pattern: "lock name in camelCase" + LockFactory suffix. For example, to inject the invoice package defined earlier:

(2) Use the #[Target] attribute

When dealing with multiple implementations of the same type the #[Target] attribute helps you select which one to inject. Symfony creates a target with the same name as the lock.

For example, to select the invoice lock defined earlier:

Before Symfony 7.4, the target name had to follow the lock.<lock-name>.factory pattern (e.g. #[Target('lock.invoice.factory')]).

Take the exam at home

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):
```php
$lock = $lockFactory->createLock('pdf-creation');
if (!$lock->acquire()) {
    return;
}

// critical section of code
$service->method();

$lock->release();
```

Example 2 (unknown):
```unknown
$ composer require symfony/lock
```

Example 3 (yaml):
```yaml
# config/packages/lock.yaml
framework:
    lock: ~
    lock: 'flock'
    lock: 'flock:///path/to/file'
    lock: 'semaphore'
    lock: 'memcached://m1.docker'
    lock: ['memcached://m1.docker', 'memcached://m2.docker']
    lock: 'redis://r1.docker'
    lock: ['redis://r1.docker', 'redis://r2.docker']
    lock: 'rediss://r1.docker?ssl[verify_peer]=1&ssl[cafile]=...'
    lock: 'zookeeper://z1.docker'
    lock: 'zookeeper://z1.docker,z2.docker'
    lock: 'zookeeper://localhost01,localhost02:2181'
    lock: 'sqlite:///%kernel.project_dir%/var/lock.db'
    lock: 'mysql:host=127.0.0.1;dbname=app'
    lock: 'pgsql:host=127.0.0.1;dbname=app'
    lock: 'pgsql+advisory:host=127.0.0.1;dbname=app'
    lock: 'sqlsrv:server=127.0.0.1;Database=app'
    lock: 'oci:host=127.0.0.1;dbname=app'
    lock: 'mongodb://127.0.0.1/app?collection=lock'
    lock: 'dynamodb://127.0.0.1/lock'
    lock: '%env(LOCK_DSN)%'
    # using an existing service
    lock: 'snc_redis.default'

    # named locks
    lock:
        invoice: ['semaphore', 'redis://r2.docker']
        report: 'semaphore'
```

Example 4 (xml):
```xml
<!-- config/packages/lock.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <framework:config>
        <framework:lock>
            <framework:resource>flock</framework:resource>

            <framework:resource>flock:///path/to/file</framework:resource>

            <framework:resource>semaphore</framework:resource>

            <framework:resource>memcached://m1.docker</framework:resource>

            <framework:resource>memcached://m1.docker</framework:resource>
            <framework:resource>memcached://m2.docker</framework:resource>

            <framework:resource>redis://r1.docker</framework:resource>

            <framework:resource>redis://r1.docker</framework:resource>
            <framework:resource>redis://r2.docker</framework:resource>

            <framework:resource>zookeeper://z1.docker</framework:resource>

            <framework:resource>zookeeper://z1.docker,z2.docker</framework:resource>

            <framework:resource>zookeeper://localhost01,localhost02:2181</framework:resource>

            <framework:resource>sqlite:///%kernel.project_dir%/var/lock.db</framework:resource>

            <framework:resource>mysql:host=127.0.0.1;dbname=app</framework:resource>

            <framework:resource>pgsql:host=127.0.0.1;dbname=app</framework:resource>

            <framework:resource>pgsql+advisory:host=127.0.0.1;dbname=app</framework:resource>

            <framework:resource>sqlsrv:server=127.0.0.1;Database=app</framework:resource>

            <framework:resource>oci:host=127.0.0.1;dbname=app</framework:resource>

            <framework:resource>mongodb://127.0.0.1/app?collection=lock</framework:resource>

            <framework:resource>dynamodb://127.0.0.1/lock</framework:resource>

            <framework:resource>%env(LOCK_DSN)%</framework:resource>

            <!-- using an existing service -->
            <framework:resource>snc_redis.default</framework:resource>

            <!-- named locks -->
            <framework:resource name="invoice">semaphore</framework:resource>
            <framework:resource name="invoice">redis://r2.docker</framework:resource>
            <framework:resource name="report">semaphore</framework:resource>
        </framework:lock>
    </framework:config>
</container>
```

---

## Workflows and State Machines

**URL:** https://symfony.com/doc/7.4/workflow/workflow-and-state-machine.html

**Contents:**
- Workflows and State Machines
- Workflows
  - Examples
- State Machines
  - Example
- Automatic and Manual Validation

A workflow is a model of a process in your application. It may be the process of how a blog post goes from draft to review and publish. Another example is when a user submits a series of different forms to complete a task. Such processes are best kept away from your models and should be defined in configuration.

A definition of a workflow consists of places and actions to get from one place to another. The actions are called transitions. A workflow also needs to know each object's position in the workflow. The marking store writes the current place to a property on the object.

The terminology above is commonly used when discussing workflows and Petri nets

The simplest workflow looks like this. It contains two places and one transition.

Workflows could be more complicated when they describe a real business case. The workflow below describes the process to fill in a job application.

When you fill in a job application in this example there are 4 to 7 steps depending on the job you are applying for. Some jobs require personality tests, logic tests and/or formal requirements to be answered by the user. Some jobs don't. The GuardEvent is used to decide what next steps are allowed for a specific application.

By defining a workflow like this, there is an overview how the process looks like. The process logic is not mixed with the controllers, models or view. The order of the steps can be changed by changing the configuration only.

A state machine is a subset of a workflow and its purpose is to hold a state of your model. The most important differences between them are:

A pull request starts in an initial "start" state, then a state "test" for e.g. running tests on continuous integration stack. When this is finished, the pull request is in the "review" state, where contributors can require changes, reject or accept the pull request. At any time, you can also "update" the pull request, which will result in another continuous integration run.

Below is the configuration for the pull request state machine.

You can omit the places option if your transitions define all the places that are used in the workflow. Symfony will automatically extract the places from the transitions.

The support for omitting the places option was introduced in Symfony 7.1.

Symfony automatically creates a service for each workflow (Workflow) or state machine (StateMachine) you have defined in your configuration. You can use the workflow inside a class by using service autowiring and using camelCased workflow name + Workflow as parameter name. If it is a state machine type, use camelCased workflow name + StateMachine:

During cache warmup, Symfony validates the workflows and state machines that are defined in configuration files. If your workflows or state machines are defined programmatically instead of in a configuration file, you can validate them with the WorkflowValidator and StateMachineValidator:

Measure & Improve Symfony Code Performance

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (yaml):
```yaml
# config/packages/workflow.yaml
framework:
    workflows:
        pull_request:
            type: 'state_machine'
            marking_store:
                 type: 'method'
                 property: 'currentPlace'
            # The "supports" option is useful only if you are using Twig functions ('workflow_*')
            supports:
                - App\Entity\PullRequest
            initial_marking: start
            places:
                - start
                - coding
                - test
                - review
                - merged
                - closed
            transitions:
                submit:
                    from: start
                    to: test
                update:
                    from: [coding, test, review]
                    to: test
                wait_for_review:
                    from: test
                    to: review
                request_change:
                    from: review
                    to: coding
                accept:
                    from: review
                    to: merged
                reject:
                    from: review
                    to: closed
                reopen:
                    from: closed
                    to: review
```

Example 2 (xml):
```xml
<!-- config/packages/workflow.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony https://symfony.com/schema/dic/symfony/symfony-1.0.xsd"
>

    <framework:config>
        <framework:workflow name="pull_request" type="state_machine">
            <framework:initial-marking>start</framework:initial-marking>

            <framework:marking-store type="method" property="currentPlace"/>

            <!-- The "supports" option is useful only if you are using Twig functions ('workflow_*') -->
            <framework:support>App\Entity\PullRequest</framework:support>

            <framework:place>start</framework:place>
            <framework:place>coding</framework:place>
            <framework:place>test</framework:place>
            <framework:place>review</framework:place>
            <framework:place>merged</framework:place>
            <framework:place>closed</framework:place>

            <framework:transition name="submit">
                <framework:from>start</framework:from>

                <framework:to>test</framework:to>
            </framework:transition>

            <framework:transition name="update">
                <framework:from>coding</framework:from>
                <framework:from>test</framework:from>
                <framework:from>review</framework:from>

                <framework:to>test</framework:to>
            </framework:transition>

            <framework:transition name="wait_for_review">
                <framework:from>test</framework:from>

                <framework:to>review</framework:to>
            </framework:transition>

            <framework:transition name="request_change">
                <framework:from>review</framework:from>

                <framework:to>coding</framework:to>
            </framework:transition>

            <framework:transition name="accept">
                <framework:from>review</framework:from>

                <framework:to>merged</framework:to>
            </framework:transition>

            <framework:transition name="reject">
                <framework:from>review</framework:from>

                <framework:to>closed</framework:to>
            </framework:transition>

            <framework:transition name="reopen">
                <framework:from>closed</framework:from>

                <framework:to>review</framework:to>
            </framework:transition>

        </framework:workflow>

    </framework:config>
</container>
```

Example 3 (php):
```php
// config/packages/workflow.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    $pullRequest = $framework->workflows()->workflow('pull_request');

    $pullRequest
        ->type('state_machine')
        // The "supports" option is useful only if you are using Twig functions ('workflow_*')
        ->supports(['App\Entity\PullRequest'])
        ->initialMarking(['start']);

    $pullRequest->markingStore()
        ->type('method')
        ->property('currentPlace');

    $pullRequest->place()->name('start');
    $pullRequest->place()->name('coding');
    $pullRequest->place()->name('test');
    $pullRequest->place()->name('review');
    $pullRequest->place()->name('merged');
    $pullRequest->place()->name('closed');

    $pullRequest->transition()
        ->name('submit')
            ->from(['start'])
            ->to(['test']);

    $pullRequest->transition()
        ->name('update')
            ->from(['coding', 'test', 'review'])
            ->to(['test']);

    $pullRequest->transition()
        ->name('wait_for_review')
            ->from(['test'])
            ->to(['review']);

    $pullRequest->transition()
        ->name('request_change')
            ->from(['review'])
            ->to(['coding']);

    $pullRequest->transition()
        ->name('accept')
            ->from(['review'])
            ->to(['merged']);

    $pullRequest->transition()
        ->name('reject')
            ->from(['review'])
            ->to(['closed']);

    $pullRequest->transition()
        ->name('reopen')
            ->from(['closed'])
            ->to(['review']);
};
```

Example 4 (php):
```php
// ...
use App\Entity\PullRequest;
use Symfony\Component\Workflow\WorkflowInterface;

class SomeService
{
    public function __construct(
        // Symfony will inject the 'pull_request' state machine configured before
        private WorkflowInterface $pullRequestStateMachine,
    ) {
    }

    public function someMethod(PullRequest $pullRequest): void
    {
        $this->pullRequestStateMachine->apply($pullRequest, 'wait_for_review', [
            'log_comment' => 'My logging comment for the wait for review transition.',
        ]);
        // ...
    }

    // ...
}
```

---

## How to Dump Workflows

**URL:** https://symfony.com/doc/7.4/workflow/dumping-workflows.html

**Contents:**
- How to Dump Workflows
- Styling

To help you debug your workflows, you can generate a visual representation of them as SVG or PNG images. First, install any of these free and open source applications needed to generate the images:

If you are defining the workflow inside a Symfony application, run this command to dump it as an image:

The DOT image will look like this:

The Mermaid image will look like this:

The PlantUML image will look like this:

If you are creating workflows outside of a Symfony application, use the GraphvizDumper or StateMachineGraphvizDumper class to create the DOT files and PlantUmlDumper to create the PlantUML files:

You can use --with-metadata option in the workflow:dump command to include places, transitions and workflow's metadata.

The DOT image will look like this :

The --with-metadata option only works for the DOT dumper for now.

The label metadata is not included in the dumped metadata, because it is used as a place's title.

You can use metadata with the following keys to style the workflow:

Strings can include \n characters to display the contents in multiple lines. Colors can be defined as:

The Mermaid dumper does not support coloring the arrow heads with arrow_color as there is no support in Mermaid for doing so.

Below is the configuration for the pull request state machine with styling added.

The PlantUML image will look like this:

Online exam, become Sylius certified today

Put the code quality back at the heart of your project

**Examples:**

Example 1 (julia):
```julia
# using Graphviz's 'dot' and SVG images
$ php bin/console workflow:dump workflow-name | dot -Tsvg -o graph.svg

# using Graphviz's 'dot' and PNG images
$ php bin/console workflow:dump workflow-name | dot -Tpng -o graph.png

# using PlantUML's 'plantuml.jar'
$ php bin/console workflow:dump workflow_name --dump-format=puml | java -jar plantuml.jar -p  > graph.png

# highlight 'place1' and 'place2' in the dumped workflow
$ php bin/console workflow:dump workflow-name place1 place2 | dot -Tsvg -o graph.svg

# using Mermaid.js CLI
$ php bin/console workflow:dump workflow_name --dump-format=mermaid | mmdc -o graph.svg
```

Example 2 (php):
```php
// Add this code to a PHP script; for example: dump-graph.php
$dumper = new GraphvizDumper();
echo $dumper->dump($definition);

# if you prefer PlantUML, use this code:
# $dumper = new PlantUmlDumper();
# echo $dumper->dump($definition);
```

Example 3 (markdown):
```markdown
# replace 'dump-graph.php' by the name of your PHP script
$ php dump-graph.php | dot -Tsvg -o graph.svg
$ php dump-graph.php | java -jar plantuml.jar -p  > graph.png
```

Example 4 (yaml):
```yaml
# config/packages/workflow.yaml
framework:
    workflows:
        pull_request:
            type: 'state_machine'
            marking_store:
                type: 'method'
                property: 'currentPlace'
            supports:
                - App\Entity\PullRequest
            initial_marking: start
            places:
                start: ~
                coding: ~
                test: ~
                review:
                    metadata:
                        description: Human review
                merged: ~
                closed:
                    metadata:
                        bg_color: DeepSkyBlue
            transitions:
                submit:
                    from: start
                    to: test
                update:
                    from: [coding, test, review]
                    to: test
                    metadata:
                        arrow_color: Turquoise
                wait_for_review:
                    from: test
                    to: review
                    metadata:
                        color: Orange
                request_change:
                    from: review
                    to: coding
                accept:
                    from: review
                    to: merged
                    metadata:
                        label: Accept PR
                reject:
                    from: review
                    to: closed
                reopen:
                    from: closed
                    to: review
```

---
