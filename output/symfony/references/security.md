# Symfony - Security

**Pages:** 9

---

## Password Hashing and Verification

**URL:** https://symfony.com/doc/7.4/security/passwords.html

**Contents:**

- Password Hashing and Verification
- Configuring a Password Hasher
- Hashing the Password
- Reset Password
  - Injecting a Specific Password Hasher
- Password Migration
  - Configure a new Hasher Using "migrate_from"
  - Upgrade the Password
    - Upgrade the Password when using Doctrine
    - Upgrade the Password when using a Custom User Provider

Most applications use passwords to log in users. These passwords should be hashed to securely store them. Symfony's PasswordHasher component provides all utilities to safely hash and verify passwords.

Make sure it is installed by running:

Before hashing passwords, you must configure a hasher using the password_hashers option. You must configure the hashing algorithm and optionally some algorithm options:

In this example, the "auto" algorithm is used. This hasher automatically selects the most secure algorithm available on your system. Combined with password migration, this allows you to always secure passwords in the safest way possible (even when new algorithms are introduced in future PHP releases).

Further in this article, you can find a full reference of all supported algorithms.

Hashing passwords is resource intensive and takes time in order to generate secure password hashes. In general, this makes your password hashing more secure.

In tests however, secure hashes are not important, so you can change the password hasher configuration in test environment to run tests faster:

After configuring the correct algorithm, you can use the UserPasswordHasherInterface to hash and verify the passwords:

Using MakerBundle and SymfonyCastsResetPasswordBundle, you can create a secure solution to handle forgotten passwords. First, install the SymfonyCastsResetPasswordBundle:

Then, use the make:reset-password command. This asks you a few questions about your app and generates all the files you need! After, you'll see a success message and a list of any other steps you need to do.

Starting in MakerBundle: v1.57.0 - You can pass either --with-uuid or --with-ulid to make:reset-password. Leveraging Symfony's Uid Component, the entities will be generated with the id type as Uuid or Ulid instead of int.

You can customize the reset password bundle's behavior by updating the reset_password.yaml file. For more information on the configuration, check out the SymfonyCastsResetPasswordBundle guide.

In some cases, you may define a password hasher in your configuration that is not tied to a user class. For example, you might use a separate hasher for password recovery codes or API tokens.

With the following configuration:

You can inject the recovery_code password hasher into any service. However, you can't rely on standard autowiring, as Symfony doesn't know which specific hasher to provide.

Instead, use the #[Target] attribute to explicitly request the hasher by its configuration key:

When injecting a specific hasher by its name, you should type-hint the generic PasswordHasherInterface.

The feature to inject specific password hashers was introduced in Symfony 7.4.

In order to protect passwords, it is recommended to store them using the latest hash algorithms. This means that if a better hash algorithm is supported on your system, the user's password should be rehashed using the newer algorithm and stored. That's possible with the migrate_from option:

When a better hashing algorithm becomes available, you should keep the existing hasher(s), rename it, and then define the new one. Set the migrate_from option on the new hasher to point to the old, legacy hasher(s):

The auto, native, bcrypt and argon hashers automatically enable password migration using the following list of migrate_from algorithms:

Both use the hash_algorithm setting as the algorithm. It is recommended to use migrate_from instead of hash_algorithm, unless the auto hasher is used.

Upon successful login, the Security system checks whether a better algorithm is available to hash the user's password. If it is, it'll hash the correct password using the new hash. When using a custom authenticator, you must use the PasswordCredentials in the security passport.

You can enable the upgrade behavior by implementing how this newly hashed password should be stored:

After this, you're done and passwords are always hashed as securely as possible!

When using the PasswordHasher component outside a Symfony application, you must manually use the PasswordHasherInterface::needsRehash() method to check if a rehash is needed and PasswordHasherInterface::hash() method to rehash the plaintext password using the new algorithm.

When using the entity user provider, implement PasswordUpgraderInterface in the UserRepository (see the Doctrine docs for information on how to create this class if it's not already created). This interface implements storing the newly created password hash:

If you're using a custom user provider, implement the PasswordUpgraderInterface in the user provider:

If you're using a custom password hasher, you can trigger the password migration by returning true in the needsRehash() method:

Usually, the same password hasher is used for all users by configuring it to apply to all instances of a specific class. Another option is to use a "named" hasher and then select which hasher you want to use dynamically.

By default (as shown at the start of the article), the auto algorithm is used for App\Entity\User.

This may be secure enough for a regular user, but what if you want your admins to have a stronger algorithm, for example auto with a higher cost. This can be done with named hashers:

This creates a hasher named harsh. In order for a User instance to use it, the class must implement PasswordHasherAwareInterface. The interface requires one method - getPasswordHasherName() - which should return the name of the hasher to use:

When migrating passwords, you don't need to implement PasswordHasherAwareInterface to return the legacy hasher name: Symfony will detect it from your migrate_from configuration.

If you created your own password hasher implementing the PasswordHasherInterface, you must register a service for it in order to use it as a named hasher:

This creates a hasher named app_hasher from a service with the ID App\Security\Hasher\MyCustomPasswordHasher.

The password hasher can be used to hash strings independently of users. By using the PasswordHasherFactory, you can declare multiple hashers, retrieve any of them with its name and create hashes. You can then verify that a string matches the given hash:

It automatically selects the best available hasher (currently Bcrypt). If PHP or Symfony adds new password hashers in the future, it might select a different hasher.

Because of this, the length of the hashed passwords may change in the future, so make sure to allocate enough space for them to be persisted (varchar(255) should be a good setting).

It produces hashed passwords with the bcrypt password hashing function. Hashed passwords are 60 characters long, so make sure to allocate enough space for them to be persisted. Also, passwords include the cryptographic salt inside them (it's generated automatically for each new password) so you don't have to deal with it.

Its only configuration option is cost, which is an integer in the range of 4-31 (by default, 13). Each single increment of the cost doubles the time it takes to hash a password. It's designed this way so the password strength can be adapted to the future improvements in computation power.

You can change the cost at any time — even if you already have some passwords hashed using a different cost. New passwords will be hashed using the new cost, while the already hashed ones will be validated using a cost that was used back when they were hashed.

A simple technique to make tests much faster when using BCrypt is to set the cost to 4, which is the minimum value allowed, in the test environment configuration.

It uses the Argon2 key derivation function. Argon2 support is available in PHP via the bundled libsodium extension.

The hashed passwords are 96 characters long, but due to the hashing requirements saved in the resulting hash this may change in the future, so make sure to allocate enough space for them to be persisted. Also, passwords include the cryptographic salt inside them (it's generated automatically for each new password) so you don't have to deal with it.

Using the PBKDF2 hasher is no longer recommended since PHP added support for Sodium and BCrypt. Legacy application still using it are encouraged to upgrade to those newer hashing algorithms.

If you need to create your own, it needs to follow these rules:

The implementations of hash() and verify() must validate that the password length is no longer than 4096 characters. This is for security reasons (see CVE-2013-5750).

You can use the isPasswordTooLong() method for this check.

Now, define a password hasher using the id setting:

Symfony Code Performance Profiling

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/password-hasher
```

Example 2 (yaml):

```yaml
# config/packages/security.yaml
security:
  # ...

  password_hashers:
    # auto hasher with default options for the User class (and children)
    App\Entity\User: "auto"

    # auto hasher with custom options for all PasswordAuthenticatedUserInterface instances
    Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface:
      algorithm: "auto"
      cost: 15
```

Example 3 (xml):

```xml
<!-- config/packages/security.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<srv:container xmlns="http://symfony.com/schema/dic/security"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:srv="http://symfony.com/schema/dic/services"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/security
        https://symfony.com/schema/dic/security/security-1.0.xsd">

    <config>
        <!-- ... -->
        <!-- auto hasher with default options for the User class (and children) -->
        <security:password-hasher
            class="App\Entity\User"
            algorithm="auto"
        />

        <!-- auto hasher with custom options for all PasswordAuthenticatedUserInterface instances -->
        <security:password-hasher
            class="Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface"
            algorithm="auto"
            cost="15"
        />
    </config>
</srv:container>
```

Example 4 (php):

```php
// config/packages/security.php
use App\Entity\User;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Config\SecurityConfig;

return static function (SecurityConfig $security): void {
    // ...

    // auto hasher with default options for the User class (and children)
    $security->passwordHasher(User::class)
        ->algorithm('auto');

    // auto hasher with custom options for all PasswordAuthenticatedUserInterface instances
    $security->passwordHasher(PasswordAuthenticatedUserInterface::class)
        ->algorithm('auto')
        ->cost(15);
};
```

---

## How to Implement CSRF Protection

**URL:** https://symfony.com/doc/7.4/security/csrf.html

**Contents:**

- How to Implement CSRF Protection
- Installation
- CSRF Protection in Symfony Forms
- CSRF Protection in Login Form and Logout Action
- Generating and Checking CSRF Tokens Manually
- CSRF Tokens and Compression Side-Channel Attacks
- Stateless CSRF Tokens
  - Using a Default Token ID
  - Generating CSRF Token Using Javascript

CSRF, or Cross-site request forgery, is a type of attack where a malicious actor tricks a user into performing actions on a web application without their knowledge or consent.

The attack is based on the trust that a web application has in a user's browser (e.g. on session cookies). Here's a real example of a CSRF attack: a malicious actor could create the following website:

If you visit this website (e.g. by clicking on some email link or some social network post) and you were already logged in on the https://example.com site, the malicious actor could change the email address associated to your account (effectively taking over your account) without you even being aware of it.

An effective way of preventing CSRF attacks is to use anti-CSRF tokens. These are unique tokens added to forms as hidden fields. The legit server validates them to ensure that the request originated from the expected source and not some other malicious website.

Anti-CSRF tokens can be managed in two ways: using a stateful approach, where tokens are stored in the session and are unique per user and action; or a stateless approach, where tokens are generated on the client side.

Symfony provides all the needed features to generate and validate the anti-CSRF tokens. Before using them, install this package in your project:

Then, enable/disable the CSRF protection with the csrf_protection option (see the CSRF configuration reference for more information):

By default, the tokens used for CSRF protection are stored in the session. That's why a session is started automatically as soon as you render a form with CSRF protection.

This leads to many strategies to help with caching pages that include CSRF protected forms, among them:

The most effective way to cache pages that need CSRF protected forms is to use stateless CSRF tokens, as explained below.

Symfony Forms include CSRF tokens by default and Symfony also checks them automatically for you. So, when using Symfony Forms, you don't have to do anything to be protected against CSRF attacks.

According to OWASP best practices, CSRF protection is only required for state-changing operations, which must not use GET requests (as per the HTTP specification). Moreover, including CSRF tokens in GET request parameters can cause them to leak through browser history, log files, network utilities, and Referer headers.

If one of your forms uses GET (for example, a read-only search form), you can configure the form to disable CSRF protection.

By default Symfony adds the CSRF token in a hidden field called \_token, but this can be customized (1) globally for all forms and (2) on a form-by-form basis. Globally, you can configure it under the framework.form option:

On a form-by-form basis, you can configure the CSRF protection in the setDefaults() method of each form:

You can also customize the rendering of the CSRF form field by creating a custom form theme and using csrf_token as the prefix of the field (e.g. define {% block csrf_token_widget %} ... {% endblock %} to customize the entire form field contents).

Although Symfony Forms provide automatic CSRF protection by default, you may need to generate and check CSRF tokens manually for example when using regular HTML forms not managed by the Symfony Form component.

Consider a HTML form created to allow deleting items. First, use the csrf_token() Twig function to generate a CSRF token in the template and store it as a hidden form field:

Then, get the value of the CSRF token in the controller action and use the isCsrfTokenValid() method to check its validity, passing the same token ID used in the template:

Alternatively you can use the IsCsrfTokenValid attribute on the controller action:

Suppose you want a CSRF token per item, so in the template you have something like the following:

This attribute can also be applied to a controller class. When used this way, the CSRF token validation will be applied to all actions defined in that controller:

The IsCsrfTokenValid attribute also accepts an Expression object evaluated to the id:

By default, the IsCsrfTokenValid attribute performs the CSRF token check for all HTTP methods. You can restrict this validation to specific methods using the methods parameter. If the request uses a method not listed in the methods array, the attribute is ignored for that request, and no CSRF validation occurs:

You can also choose where the CSRF token is read from using the tokenSource parameter. This is a bitfield that allows you to combine different sources:

The token is checked against each selected source, and validation fails if none match.

The IsCsrfTokenValid attribute was introduced in Symfony 7.1.

The methods parameter was introduced in Symfony 7.3.

The tokenSource parameter was introduced in Symfony 7.4.

BREACH and CRIME are security exploits against HTTPS when using HTTP compression. Attackers can leverage information leaked by compression to recover targeted parts of the plaintext. To mitigate these attacks, and prevent an attacker from guessing the CSRF tokens, a random mask is prepended to the token and used to scramble it.

Stateless anti-CSRF protection was introduced in Symfony 7.2.

Traditionally, CSRF tokens are stateful, meaning they're stored in the session. However, some token IDs can be declared as stateless using the stateless_token_ids option. Stateless CSRF tokens are enabled by default in applications using Symfony Flex.

Stateless CSRF tokens provide protection without relying on the session. This allows you to fully cache pages while still protecting against CSRF attacks.

When validating a stateless CSRF token, Symfony checks the Origin and Referer headers of the incoming HTTP request. If either header matches the application's target origin (i.e. its domain), the token is considered valid.

This mechanism relies on the application being able to determine its own origin. If you're behind a reverse proxy, make sure it's properly configured. See How to Configure Symfony to Work behind a Load Balancer or a Reverse Proxy.

Stateful CSRF tokens are typically scoped per form or action, while stateless tokens don't require many identifiers.

In the example above, the authenticate and logout identifiers are listed because they are used by default in the Symfony Security component. The submit identifier is included so that form types defined by the application can also use CSRF protection by default.

The following configuration applies only to form types registered via autoconfiguration (which is the default for your own services), and it sets submit as their default token identifier:

Forms configured with a token identifier listed in the above stateless_token_ids option will use the stateless CSRF protection.

In addition to the Origin and Referer HTTP headers, stateless CSRF protection can also validate tokens using a cookie and a header (named csrf-token by default; see the CSRF configuration reference).

These additional checks are part of the defense-in-depth strategy provided by stateless CSRF protection. They are optional and require some JavaScript to be enabled. This JavaScript generates a cryptographically secure random token when a form is submitted. It then inserts the token into the form's hidden CSRF field and sends it in both a cookie and a request header.

On the server side, CSRF token validation compares the values in the cookie and the header. This "double-submit" protection relies on the browser's same-origin policy and is further hardened by:

By default, the Symfony JavaScript snippet expects the hidden CSRF field to be named \_csrf_token or to include the data-controller="csrf-protection" attribute. You can adapt this logic to your needs as long as the same protocol is followed.

To prevent validation from being downgraded, an extra behavioral check is performed: if (and only if) a session already exists, successful "double-submit" is remembered and becomes required for future requests. This ensures that once the optional cookie/header validation has been proven effective, it remains enforced for that session.

Enforcing "double-submit" validation on all requests is not recommended, as it may lead to a broken user experience. The opportunistic approach described above is preferred, allowing the application to gracefully fall back to Origin / Referer checks when JavaScript is unavailable.

Symfony Code Performance Profiling

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (html):

```html
<html>
  <body>
    <form action="https://example.com/settings/update-email" method="POST">
      <input
        type="hidden"
        name="email"
        value="malicious-actor-address@some-domain.com"
      />
    </form>
    <script>
      document.forms[0].submit();
    </script>

    <!-- some content here to distract the user -->
  </body>
</html>
```

Example 2 (unknown):

```unknown
$ composer require symfony/security-csrf
```

Example 3 (yaml):

```yaml
# config/packages/framework.yaml
framework:
  # ...
  csrf_protection: ~
```

Example 4 (xml):

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
        <framework:csrf-protection enabled="true"/>
    </framework:config>
</container>
```

---

## Authenticating against an LDAP server

**URL:** https://symfony.com/doc/7.4/security/ldap.html

**Contents:**

- Authenticating against an LDAP server
- Installation
- Ldap Configuration Reference
- Configuring the LDAP client
- Fetching Users Using the LDAP User Provider
  - service
  - base_dn
  - search_dn
  - search_password
  - default_roles

Symfony provides different means to work with an LDAP server.

The Security component offers:

This means that the following scenarios will work:

In applications using Symfony Flex, run this command to install the Ldap component before using it:

See Security Configuration Reference (SecurityBundle) for the full LDAP configuration reference (form_login_ldap, http_basic_ldap, ldap). Some of the more interesting options are explained below.

All mechanisms actually need an LDAP client previously configured. The providers are configured to use a default service named ldap, but you can override this setting in the security component's configuration.

An LDAP client can be configured using the built-in LDAP PHP extension with the following service definition:

If you want to fetch user information from an LDAP server, you may want to use the ldap user provider.

The Security component escapes provided input data when the LDAP user provider is used. However, the LDAP component itself does not provide any escaping yet. Thus, it's your responsibility to prevent LDAP injection attacks when using the component directly.

The user configured above in the user provider is only used to retrieve data. It's a static user defined by its username and password (for improved security, define the password as an environment variable).

If your LDAP server allows retrieval of information anonymously, you can set the search_dn and search_password options to null.

The ldap user provider supports many different configuration options:

type: string default: ldap

This is the name of your configured LDAP client. You can freely choose the name, but it must be unique in your application and it cannot start with a number or contain white spaces.

type: string default: null

This is the base DN for the directory

type: string default: null

This is your read-only user's DN, which will be used to authenticate against the LDAP server to fetch the user's information.

type: string default: null

This is your read-only user's password, which will be used to authenticate against the LDAP server to fetch the user's information.

type: array default: []

This is the default role you wish to give to a user fetched from the LDAP server. If you do not configure this key, your users won't have any roles, and will not be considered as authenticated fully.

Type: string Default: null

When your LDAP service provides user roles, this option allows you to define the service that retrieves these roles. The role fetcher service must implement the Symfony\Component\Ldap\Security\RoleFetcherInterface. When this option is set, the default_roles option is ignored.

Symfony provides Symfony\Component\Ldap\Security\MemberOfRoles, a concrete implementation of the interface that fetches roles from the ismemberof attribute.

The role_fetcher configuration option was introduced in Symfony 7.3.

type: string default: null

This is the entry's key to use as its UID. Depends on your LDAP server implementation. Commonly used values are:

If you pass null as the value of this option, the default UID key is used sAMAccountName.

type: array default: null

Defines the custom fields to pull from the LDAP server. If any field does not exist, an \InvalidArgumentException will be thrown.

type: string default: null

This key lets you configure which LDAP query will be used. The {uid_key} string will be replaced by the value of the uid_key configuration value (by default, sAMAccountName), and the {user_identifier} string will be replaced by the user identified you are trying to load.

For example, with a uid_key of uid, and if you are trying to load the user fabpot, the final string will be: (uid=fabpot).

If you pass null as the value of this option, the default filter is used ({uid_key}={user_identifier}).

To prevent LDAP injection, the username will be escaped.

The syntax for the filter key is defined by RFC4515.

Authenticating against an LDAP server can be done using either the form login or the HTTP Basic authentication providers.

They are configured exactly as their non-LDAP counterparts, with the addition of two configuration keys and one optional key:

type: string default: ldap

This is the name of your configured LDAP client. You can freely choose the name, but it must be unique in your application and it cannot start with a number or contain white spaces.

type: string default: {user_identifier}

This key defines the form of the string used to compose the DN of the user, from the username. The {user_identifier} string is replaced by the actual username of the person trying to authenticate.

For example, if your users have DN strings in the form uid=einstein,dc=example,dc=com, then the dn_string will be uid={user_identifier},dc=example,dc=com.

type: string default: null

This (optional) key makes the user provider search for a user and then use the found DN for the bind process. This is useful when using multiple LDAP user providers with different base_dn. The value of this option must be a valid search string (e.g. uid="{user_identifier}"). The placeholder value will be replaced by the actual user identifier.

When this option is used, query_string will search in the DN specified by dn_string and the DN resulted of the query_string will be used to authenticate the user with their password. Following the previous example, if your users have the following two DN: dc=companyA,dc=example,dc=com and dc=companyB,dc=example,dc=com, then dn_string should be dc=example,dc=com.

Note that usernames must be unique across both DN, as the authentication provider won't be able to select the correct user for the bind process if more than one is found.

Examples are provided below, for both form_login_ldap and http_basic_ldap.

Measure & Improve Symfony Code Performance

Make sure your project is risk free

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/ldap
```

Example 2 (yaml):

```yaml
# config/services.yaml
services:
  Symfony\Component\Ldap\Ldap:
    arguments: ['@Symfony\Component\Ldap\Adapter\ExtLdap\Adapter']
    tags:
      - ldap
  Symfony\Component\Ldap\Adapter\ExtLdap\Adapter:
    arguments:
      - host: my-server
        port: 389
        encryption: tls
        options:
          protocol_version: 3
          referrals: false
```

Example 3 (xml):

```xml
<!-- config/services.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/services https://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Symfony\Component\Ldap\Ldap">
            <argument type="service" id="Symfony\Component\Ldap\Adapter\ExtLdap\Adapter"/>
            <tag name="ldap"/>
        </service>
        <service id="Symfony\Component\Ldap\Adapter\ExtLdap\Adapter">
            <argument type="collection">
                <argument key="host">my-server</argument>
                <argument key="port">389</argument>
                <argument key="encryption">tls</argument>
                <argument key="options" type="collection">
                    <argument key="protocol_version">3</argument>
                    <argument key="referrals">false</argument>
                </argument>
            </argument>
        </service>
    </services>
</container>
```

Example 4 (php):

```php
// config/services.php
use Symfony\Component\Ldap\Adapter\ExtLdap\Adapter;
use Symfony\Component\Ldap\Ldap;

$container->register(Ldap::class)
    ->addArgument(new Reference(Adapter::class))
    ->tag('ldap');

$container
    ->register(Adapter::class)
    ->setArguments([
        'host' => 'my-server',
        'port' => 389,
        'encryption' => 'tls',
        'options' => [
            'protocol_version' => 3,
            'referrals' => false
        ],
    ]);
```

---

## Symfony and HTTP Fundamentals

**URL:** https://symfony.com/doc/7.4/introduction/http_fundamentals.html

**Contents:**

- Symfony and HTTP Fundamentals
- Requests and Responses in HTTP
  - Step 1: The Client Sends a Request
  - Step 2: The Server Returns a Response
  - Requests, Responses and Web Development
- Requests and Responses in PHP
- Requests and Responses in Symfony
  - Symfony Request Object
  - Symfony Response Object
- The Journey from the Request to the Response

Great news! While you're learning Symfony, you're also learning the fundamentals of the web. Symfony is closely modeled after the HTTP Request-Response flow: that fundamental paradigm that's behind almost all communication on the web.

In this article, you'll walk through the HTTP fundamentals and find out how these are applied throughout Symfony.

HTTP (Hypertext Transfer Protocol) is a text language that allows two machines to communicate with each other. For example, when checking for the latest xkcd comic, the following (approximate) conversation takes place:

HTTP is the term used to describe this text-based language. The goal of your server is always to understand text requests and return text responses.

Symfony is built from the ground up around that reality. Whether you realize it or not, HTTP is something you use every day. With Symfony, you'll learn how to master it.

Every conversation on the web starts with a request. The request is a text message created by a client (e.g. a browser, a smartphone app, etc) in a special format known as HTTP. The client sends that request to a server, and then waits for the response.

Take a look at the first part of the interaction (the request) between a browser and the xkcd web server:

In HTTP-speak, this HTTP request would actually look something like this:

These few lines communicate everything necessary about exactly which resource the client is requesting. The first line of an HTTP request is the most important, because it contains two important things: the HTTP method (GET) and the URI (/).

The URI (e.g. /, /contact, etc) is the unique address or location that identifies the resource the client wants. The HTTP method (e.g. GET) defines what the client wants to do with the resource. The HTTP methods (also known as verbs) define the few common ways that the client can act upon the resource - the most common HTTP methods are:

With this in mind, you can imagine what an HTTP request might look like to delete a specific blog post, for example:

There are actually nine HTTP methods defined by the HTTP specification, but many of them are not widely used or supported. In reality, many modern browsers only support POST and GET in HTML forms. Various others are however supported in XMLHttpRequest.

In addition to the first line, an HTTP request invariably contains other lines of information called request headers. The headers can supply a wide range of information such as the host of the resource being requested (Host), the response formats the client accepts (Accept) and the application the client is using to make the request (User-Agent). Many other headers exist and can be found on Wikipedia's List of HTTP header fields article.

Once a server has received the request, it knows exactly which resource the client needs (via the URI) and what the client wants to do with that resource (via the method). For example, in the case of a GET request, the server prepares the resource and returns it in an HTTP response. Consider the response from the xkcd web server:

Translated into HTTP, the response sent back to the browser will look something like this:

The HTTP response contains the requested resource (the HTML content in this case), as well as other information about the response. The first line is especially important and contains the HTTP response status code (200 in this case).

The status code communicates the overall outcome of the request back to the client. Was the request successful? Was there an error? Different status codes exist that indicate success, an error or that the client needs to do something (e.g. redirect to another page). Check out the list of HTTP status codes.

Like the request, an HTTP response contains additional pieces of information known as HTTP headers. The body of the same resource could be returned in multiple different formats like HTML, XML or JSON and the Content-Type header uses Internet Media Types like text/html to tell the client which format is being returned. You can see a List of common media types from IANA.

Many other headers exist, some of which are very powerful. For example, certain headers can be used to create a powerful caching system.

This request-response conversation is the fundamental process that drives all communication on the web.

The most important fact is this: regardless of the language you use, the type of application you build (web, mobile, JSON API) or the development philosophy you follow, the end goal of an application is always to understand each request and create and return the appropriate response.

To learn more about the HTTP specification, read the original HTTP 1.1 RFC or the HTTP Bis, which is an active effort to clarify the original specification.

So how do you interact with the "request" and create a "response" when using PHP? In reality, PHP abstracts you a bit from the whole process:

As strange as it sounds, this small application is in fact taking information from the HTTP request and using it to create an HTTP response. Instead of parsing the raw HTTP request message, PHP prepares superglobal variables (such as $\_SERVER and $\_GET) that contain all the information from the request. Similarly, instead of returning the HTTP-formatted text response, you can use the PHP header function to create response headers and print out the actual content that will be the content portion of the response message. PHP will create a true HTTP response and return it to the client:

Symfony provides an alternative to the raw PHP approach via two classes that allow you to interact with the HTTP request and response in an easier way.

The Request class is an object-oriented representation of the HTTP request message. With it, you have all the request information at your fingertips:

As a bonus, the Request class does a lot of work in the background about which you will never need to worry. For example, the isSecure() method checks the three different values in PHP that can indicate whether or not the user is connecting via a secure connection (i.e. HTTPS).

Symfony also provides a Response class: a PHP representation of an HTTP response message. This allows your application to use an object-oriented interface to construct the response that needs to be returned to the client:

There are also several response sub-classes to help you return JSON, redirect, stream file downloads and more.

The Request and Response classes are part of a standalone component called symfony/http-foundation that you can use in any PHP project. This also contains classes for handling sessions, file uploads and more.

If Symfony offered nothing else, you would already have a toolkit for accessing request information and an object-oriented interface for creating the response. Even as you learn the many powerful features in Symfony, keep in mind that the goal of your application is always to interpret a request and create the appropriate response based on your application logic.

Like HTTP itself, using the Request and Response objects is pretty straightforward. The hard part of building an application is writing what comes in between. In other words, the real work comes in writing the code that interprets the request information and creates the response.

Your application probably does many things, like sending emails, handling form submissions, saving things to a database, rendering HTML pages and protecting content with security. How can you manage all of this and still keep your code organized and maintainable? Symfony was created to help you with these problems.

Traditionally, applications were built so that each "page" of a site was its own physical file (e.g. index.php, contact.php, etc.).

There are several problems with this approach, including the inflexibility of the URLs (what if you wanted to change blog.php to news.php without breaking all of your links?) and the fact that each file must manually include some set of core files so that security, database connections and the "look" of the site can remain consistent.

A much better solution is to use a front controller: a single PHP file that handles every request coming into your application. For example:

By using rewrite rules in your web server configuration, the index.php won't be needed and you will have beautiful, clean URLs (e.g. /show).

Now, every request is handled exactly the same way. Instead of individual URLs executing different PHP files, the front controller is always executed, and the routing of different URLs to different parts of your application is done internally.

A small front controller might look like this:

This is better, but this is still a lot of repeated work! Fortunately, Symfony can help once again.

A Symfony framework application also uses a front-controller file. But inside, Symfony is responsible for handling each incoming request and figuring out what to do:

Incoming requests are interpreted by the Routing component and passed to PHP functions that return Response objects.

This may not make sense yet, but as you keep reading, you'll learn about routes and controllers: the two fundamental parts to creating a page. But as you go along, don't forget that no matter how complex your app gets, your job is always the same: read information from the Request and use it to create a Response.

Here's what we've learned so far:

Measure & Improve Symfony Code Performance

Online exam, become Sylius certified today

**Examples:**

Example 1 (yaml):

```yaml
GET / HTTP/1.1
Host: xkcd.com
Accept: text/html
User-Agent: Mozilla/5.0 (Macintosh)
```

Example 2 (unknown):

```unknown
DELETE /blog/15 HTTP/1.1
```

Example 3 (html):

```html
HTTP/1.1 200 OK Date: Sat, 02 Apr 2011 21:05:05 GMT Server: lighttpd/1.4.19
Content-Type: text/html

<html>
  <!-- ... HTML for the xkcd comic -->
</html>
```

Example 4 (bash):

```bash
$uri = $_SERVER['REQUEST_URI'];
$foo = $_GET['foo'];

header('Content-Type: text/html');
echo 'The URI requested is: '.$uri;
echo 'The value of the "foo" parameter is: '.$foo;
```

---

## Symfony versus Flat PHP

**URL:** https://symfony.com/doc/7.4/introduction/from_flat_php_to_symfony.html

**Contents:**

- Symfony versus Flat PHP
- A Basic Blog in Flat PHP
  - Isolating the Presentation
  - Isolating the Application (Domain) Logic
  - Isolating the Layout
- Adding a Blog "show" Page
- A "Front Controller" to the Rescue
  - Creating the Front Controller
  - Add a Touch of Symfony
  - The Sample Application in Symfony

Why is Symfony better than just opening up a file and writing flat PHP?

If you've never used a PHP framework, aren't familiar with the Model-View-Controller (MVC) philosophy, or just wonder what all the hype is around Symfony, this article is for you. Instead of telling you that Symfony allows you to develop faster and better software than with flat PHP, you'll see for yourself.

In this article, you'll write a basic application in flat PHP, and then refactor it to be more organized. You'll travel through time, seeing the decisions behind why web development has evolved over the past several years to where it is now.

By the end, you'll see how Symfony can rescue you from mundane tasks and let you take back control of your code.

In this article, you'll build the token blog application using only flat PHP. To begin, create a single page that displays blog entries that have been persisted to the database. Writing in flat PHP is quick and dirty:

That's quick to write, fast to deploy and run, and, as your app grows, impossible to maintain. There are several problems that need to be addressed:

Another problem not mentioned here is the fact that the database is tied to MySQL. Though not covered here, Symfony fully integrates Doctrine, a library dedicated to database abstraction and mapping.

The code can immediately gain from separating the application "logic" from the code that prepares the HTML "presentation":

The HTML code is now stored in a separate file templates/list.php, which is primarily an HTML file that uses a template-like PHP syntax:

By convention, the file that contains all the application logic - index.php - is known as a "controller". The term controller is a word you'll hear a lot, regardless of the language or framework you use. It refers to the area of your code that processes user input and prepares the response.

In this case, the controller prepares data from the database and then includes a template to present that data. With the controller isolated, you could change just the template file if you needed to render the blog entries in some other format (e.g. list.json.php for JSON format).

So far the application contains only one page. But what if a second page needed to use the same database connection, or even the same array of blog posts? Refactor the code so that the core behavior and data-access functions of the application are isolated in a new file called model.php:

The filename model.php is used because the logic and data access of an application is traditionally known as the "model" layer. In a well-organized application, the majority of the code representing your "business logic" should live in the model (as opposed to living in a controller). And unlike in this example, only a portion (or none) of the model is actually concerned with accessing a database.

The controller (index.php) is now only a few lines of code:

Now, the sole task of the controller is to get data from the model layer of the application (the model) and to call a template to render that data. This is a very concise example of the model-view-controller pattern.

At this point, the application has been refactored into three distinct pieces offering various advantages and the opportunity to reuse almost everything on different pages.

The only part of the code that can't be reused is the page layout. Fix that by creating a new templates/layout.php file:

The template templates/list.php can now be simplified to "extend" the templates/layout.php:

You now have a setup that will allow you to reuse the layout. Unfortunately, to accomplish this, you're forced to use a few ugly PHP functions (ob_start(), ob_get_clean()) in the template. Symfony solves this using Twig. You'll see it in action shortly.

The blog "list" page has now been refactored so that the code is better-organized and reusable. To prove it, add a blog "show" page, which displays an individual blog post identified by an id query parameter.

To begin, create a new function in the model.php file that retrieves an individual blog result based on a given id:

Next, create a new file called show.php - the controller for this new page:

Finally, create the new template file - templates/show.php - to render the individual blog post:

Creating the second page now requires very little work and no code is duplicated. Still, this page introduces even more lingering problems that a framework can solve for you. For example, a missing or invalid id query parameter will cause the page to crash. It would be better if this caused a 404 page to be rendered, but this can't really be done yet.

Another major problem is that each individual controller file must include the model.php file. What if each controller file suddenly needed to include an additional file or perform some other global task (e.g. enforce security)? As it stands now, that code would need to be added to every controller file. If you forget to include something in one file, hopefully it doesn't relate to security...

The solution is to use a front controller: a single PHP file through which all requests are processed. With a front controller, the URIs for the application change slightly, but start to become more flexible:

By using rewrite rules in your web server configuration, the index.php won't be needed and you will have beautiful, clean URLs (e.g. /show).

When using a front controller, a single PHP file (index.php in this case) renders every request. For the blog post show page, /index.php/show will actually execute the index.php file, which is now responsible for routing requests internally based on the full URI. As you'll see, a front controller is a very powerful tool.

You're about to take a big step with the application. With one file handling all requests, you can centralize things such as security handling, configuration loading, and routing. In this application, index.php must now be smart enough to render the blog post list page or the blog post show page based on the requested URI:

For organization, both controllers (formerly /index.php and /index.php/show) are now PHP functions and each has been moved into a separate file named controllers.php:

As a front controller, index.php has taken on an entirely new role, one that includes loading the core libraries and routing the application so that one of the two controllers (the list_action() and show_action() functions) is called. In reality, the front controller is beginning to look and act a lot like how Symfony handles and routes requests.

But be careful not to confuse the terms front controller and controller. Your app will usually have only one front controller, which boots your code. You will have many controller functions: one for each page.

Another advantage of a front controller is flexible URLs. Notice that the URL to the blog post show page could be changed from /show to /read by changing code in only one location. Before, an entire file needed to be renamed. In Symfony, URLs are even more flexible.

By now, the application has evolved from a single PHP file into a structure that is organized and allows for code reuse. You should be happier, but far from being satisfied. For example, the routing system is fickle, and wouldn't recognize that the list page - /index.php - should be accessible also via / (if Apache rewrite rules were added). Also, instead of developing the blog, a lot of time is being spent working on the "architecture" of the code (e.g. routing, calling controllers, templates, etc.). More time will need to be spent to handle form submissions, input validation, logging and security. Why should you have to reinvent solutions to all these routine problems?

Symfony to the rescue. Before actually using Symfony, you need to download it. This can be done by using Composer, which takes care of downloading the correct version and all its dependencies and provides an autoloader. An autoloader is a tool that makes it possible to start using PHP classes without explicitly including the file containing the class.

In your root directory, create a composer.json file with the following content:

Next, download Composer and then run the following command, which will download Symfony into a vendor/ directory:

Beside downloading your dependencies, Composer generates a vendor/autoload.php file, which takes care of autoloading for all the files in the Symfony Framework as well as the files mentioned in the autoload section of your composer.json.

Core to Symfony's philosophy is the idea that an application's main job is to interpret each request and return a response. To this end, Symfony provides both a Request and a Response class. These classes are object-oriented representations of the raw HTTP request being processed and the HTTP response being returned. Use them to improve the blog:

The controllers are now responsible for returning a Response object. To make this easier, you can add a new render_template() function, which, incidentally, acts quite a bit like the Symfony templating engine:

By bringing in a small part of Symfony, the application is more flexible and reliable. The Request provides a dependable way to access information about the HTTP request. Specifically, the getPathInfo() method returns a cleaned URI (always returning /show and never /index.php/show). So, even if the user goes to /index.php/show, the application is intelligent enough to route the request through show_action().

The Response object gives flexibility when constructing the HTTP response, allowing HTTP headers and content to be added via an object-oriented interface. And while the responses in this application are simple, this flexibility will pay dividends as your application grows.

The blog has come a long way, but it still contains a lot of code for such a basic application. Along the way, you've made a basic routing system and a function using ob_start() and ob_get_clean() to render templates. If, for some reason, you needed to continue building this "framework" from scratch, you could at least use Symfony's standalone Routing component and Twig, which already solve these problems.

Instead of re-solving common problems, you can let Symfony take care of them for you. Here's the same sample application, now built in Symfony:

Notice, both controller functions now live inside a "controller class". This is a nice way to group related pages. The controller functions are also sometimes called actions.

The two controllers (or actions) are still lightweight. Each uses the Doctrine ORM library to retrieve objects from the database and Twig to render a template and return a Response object. The list.html.twig template is now quite a bit simpler, and uses Twig:

The layout.php file is nearly identical:

The show.html.twig template is left as an exercise: updating it should be really similar to updating the list.html.twig template.

When Symfony's engine (called the Kernel) boots up, it needs a map so that it knows which controllers to call based on the request information. A routing configuration map - config/routes.yaml - provides this information in a readable format:

Now that Symfony is handling all the mundane tasks, the front controller public/index.php is reduced to bootstrapping. And since it does so little, you'll never have to touch it:

The front controller's only job is to initialize Symfony's engine (called the Kernel) and pass it a Request object to handle. The Symfony core asks the router to inspect the request. The router matches the incoming URL to a specific route and returns information about the route, including the controller that should be called. The correct controller from the matched route is called and your code inside the controller creates and returns the appropriate Response object. The HTTP headers and content of the Response object are sent back to the client.

It's a beautiful thing.

In the rest of the documentation articles, you'll learn more about how each piece of Symfony works and how you can organize your project. For now, celebrate how migrating the blog from flat PHP to Symfony has improved your life:

And perhaps best of all, by using Symfony, you now have access to a whole set of high-quality open source tools developed by the Symfony community! A good selection of Symfony community tools can be found on GitHub.

Measure & Improve Symfony Code Performance

Get your Sylius expertise recognized

**Examples:**

Example 1 (php):

```php
<?php
// index.php
$connection = new PDO("mysql:host=localhost;dbname=blog_db", 'myuser', 'mypassword');

$result = $connection->query('SELECT id, title FROM post');
?>

<!DOCTYPE html>
<html>
    <head>
        <title>List of Posts</title>
    </head>
    <body>
        <h1>List of Posts</h1>
        <ul>
            <?php while ($row = $result->fetch(PDO::FETCH_ASSOC)): ?>
            <li>
                <a href="/show.php?id=<?= $row['id'] ?>">
                    <?= $row['title'] ?>
                </a>
            </li>
            <?php endwhile ?>
        </ul>
    </body>
</html>

<?php
$connection = null;
?>
```

Example 2 (sql):

```sql
// index.php
$connection = new PDO("mysql:host=localhost;dbname=blog_db", 'myuser', 'mypassword');

$result = $connection->query('SELECT id, title FROM post');

$posts = [];
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    $posts[] = $row;
}

$connection = null;

// include the HTML presentation code
require 'templates/list.php';
```

Example 3 (html):

```html
<!-- templates/list.php -->
<!DOCTYPE html>
<html>
  <head>
    <title>List of Posts</title>
  </head>
  <body>
    <h1>List of Posts</h1>
    <ul>
      <?php foreach ($posts as $post): ?>
      <li>
        <a href="/show.php?id=<?= $post['id'] ?>"> <?= $post['title'] ?> </a>
      </li>
      <?php endforeach ?>
    </ul>
  </body>
</html>
```

Example 4 (php):

```php
// model.php
function open_database_connection()
{
    $connection = new PDO("mysql:host=localhost;dbname=blog_db", 'myuser', 'mypassword');

    return $connection;
}

function close_database_connection(&$connection)
{
    $connection = null;
}

function get_all_posts()
{
    $connection = open_database_connection();

    $result = $connection->query('SELECT id, title FROM post');

    $posts = [];
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $posts[] = $row;
    }
    close_database_connection($connection);

    return $posts;
}
```

---

## Introduction

**URL:** https://symfony.com/doc/7.4/create_framework/introduction.html

**Contents:**

- Introduction
- Why would you Like to Create your Own Framework?
- Before You Start
- Bootstrapping
  - Dependency Management
- Our Project

Symfony is a reusable set of standalone, decoupled and cohesive PHP components that solve common web development problems.

Instead of using these low-level components, you can use the ready-to-be-used Symfony full-stack web framework, which is based on these components... or you can create your very own framework. This tutorial is about the latter.

Why would you like to create your own framework in the first place? If you look around, everybody will tell you that it's a bad thing to reinvent the wheel and that you'd better choose an existing framework and forget about creating your own altogether. Most of the time, they are right but there are a few good reasons to start creating your own framework:

This tutorial will gently guide you through the creation of a web framework, one step at a time. At each step, you will have a fully-working framework that you can use as is or as a start for your very own. It will start with a simple framework and more features will be added with time. Eventually, you will have a fully-featured full-stack web framework.

And each step will be the occasion to learn more about some of the Symfony Components.

Many modern web frameworks advertise themselves as being MVC frameworks. This tutorial won't talk about the MVC pattern, as the Symfony Components are able to create any type of frameworks, not just the ones that follow the MVC architecture. Anyway, if you have a look at the MVC semantics, this book is about how to create the Controller part of a framework. For the Model and the View, it really depends on your personal taste and you can use any existing third-party libraries (Doctrine, Propel or plain-old PDO for the Model; PHP or Twig for the View).

When creating a framework, following the MVC pattern is not the right goal. The main goal should be the Separation of Concerns; this is probably the only design pattern that you should really care about. The fundamental principles of the Symfony Components are focused on the HTTP specification. As such, the framework that you are going to create should be more accurately labelled as a HTTP framework or Request/Response framework.

Reading about how to create a framework is not enough. You will have to follow along and actually type all the examples included in this tutorial. For that, you need a recent version of PHP (7.4 or later is good enough), a web server (like Apache, nginx or PHP's built-in web server), a good knowledge of PHP and an understanding of Object Oriented Programming.

Ready to go? Read on!

Before you can even think of creating the first framework, you need to think about some conventions: where you will store the code, how you will name the classes, how you will reference external dependencies, etc.

To store your new framework, create a directory somewhere on your machine:

To install the Symfony Components that you need for your framework, you are going to use Composer, a project dependency manager for PHP. If you don't have it yet, download and install Composer now.

Instead of creating our framework from scratch, we are going to write the same "application" over and over again, adding one abstraction at a time. Let's start with the simplest web application we can think of in PHP:

You can use the Symfony local web server to test this great application in a browser (http://localhost:8000/index.php?name=Fabien):

In the next chapter, we are going to introduce the HttpFoundation Component and see what it brings us.

Symfony Code Performance Profiling

Get your Sylius expertise recognized

**Examples:**

Example 1 (unknown):

```unknown
$ mkdir framework
$ cd framework
```

Example 2 (c):

```c
// framework/index.php
$name = $_GET['name'];

printf('Hello %s', $name);
```

Example 3 (unknown):

```unknown
$ symfony server:start
```

---

## PasswordStrength

**URL:** https://symfony.com/doc/7.4/reference/constraints/PasswordStrength.html

**Contents:**

- PasswordStrength
- Basic Usage
- Available Options
  - minScore
  - message
- Customizing the Password Strength Estimation

Validates that the given password has reached the minimum strength required by the constraint. The strength of the password is not evaluated with a set of predefined rules (include a number, use lowercase and uppercase characters, etc.) but by measuring the entropy of the password based on its length and the number of unique characters used.

The following constraint ensures that the rawPassword property of the User class reaches the minimum strength required by the constraint. By default, the minimum required score is 2.

type: integer default: PasswordStrength::STRENGTH_MEDIUM (2)

The minimum required strength of the password. Available constants are:

PasswordStrength::STRENGTH_VERY_WEAK is available but only used internally or by a custom password strength estimator.

type: string default: The password strength is too low. Please use a stronger password.

The default message supplied when the password does not reach the minimum required score.

The feature to customize the password strength estimation was introduced in Symfony 7.2.

By default, this constraint calculates the strength of a password based on its length and the number of unique characters used. You can get the calculated password strength (e.g. to display it in the user interface) using the following static function:

If you need to override the default password strength estimation algorithm, you can pass a Closure to the PasswordStrengthValidator constructor (e.g. using the service closures).

First, create a custom password strength estimation algorithm within a dedicated callable class:

Then, configure the PasswordStrengthValidator service to use your own estimator:

Measure & Improve Symfony Code Performance

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):

```php
// src/Entity/User.php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class User
{
    #[Assert\PasswordStrength]
    protected $rawPassword;
}
```

Example 2 (markdown):

```markdown
# config/validator/validation.yaml

App\Entity\User:
properties:
rawPassword: - PasswordStrength
```

Example 3 (xml):

```xml
<!-- config/validator/validation.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<constraint-mapping xmlns="http://symfony.com/schema/dic/constraint-mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/constraint-mapping https://symfony.com/schema/dic/constraint-mapping/constraint-mapping-1.0.xsd">

    <class name="App\Entity\User">
        <property name="rawPassword">
            <constraint name="PasswordStrength"/>
        </property>
    </class>
</constraint-mapping>
```

Example 4 (php):

```php
// src/Entity/User.php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Mapping\ClassMetadata;

class User
{
    public static function loadValidatorMetadata(ClassMetadata $metadata)
    {
        $metadata->addPropertyConstraint('rawPassword', new Assert\PasswordStrength());
    }
}
```

---

## The Entry Point: Helping Users Start Authentication

**URL:** https://symfony.com/doc/7.4/security/entry_point.html

**Contents:**

- The Entry Point: Helping Users Start Authentication
- Multiple Authenticators with Separate Entry Points

When an unauthenticated user tries to access a protected page, Symfony gives them a suitable response to let them start authentication (e.g. redirect to a login form or show a 401 Unauthorized HTTP response for APIs).

However sometimes, one firewall has multiple ways to authenticate (e.g. both a form login and a social login). In these cases, it is required to configure the authentication entry point.

You can configure this using the entry_point setting:

You can also create your own authentication entry point by creating a class that implements AuthenticationEntryPointInterface. You can then set entry_point to the service id (e.g. entry_point: App\Security\CustomEntryPoint)

However, there are use cases where you have authenticators that protect different parts of your application. For example, you have a login form that protects the main website and API end-points used by external parties protected by API keys.

As you can only configure one entry point per firewall, the solution is to split the configuration into two separate firewalls:

Check Code Performance in Dev, Test, Staging & Production

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (yaml):

```yaml
# config/packages/security.yaml
security:
  # ...
  firewalls:
    main:
      # allow authentication using a form or a custom authenticator
      form_login: ~
      custom_authenticators:
        - App\Security\SocialConnectAuthenticator

      # configure the form authentication as the entry point for unauthenticated users
      entry_point: form_login
```

Example 2 (xml):

```xml
<!-- config/packages/security.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<srv:container xmlns="http://symfony.com/schema/dic/security"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:srv="http://symfony.com/schema/dic/services"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/security
        https://symfony.com/schema/dic/security/security-1.0.xsd">

    <config>
        <!-- ... -->

        <!-- entry-point: configure the form authentication as the entry
                          point for unauthenticated users -->
        <firewall name="main"
            entry-point="form_login"
        >
            <!-- allow authentication using a form or a custom authenticator -->
            <form-login/>
            <custom-authenticator>App\Security\SocialConnectAuthenticator</custom-authenticator>
        </firewall>
    </config>
</srv:container>
```

Example 3 (php):

```php
// config/packages/security.php
use App\Security\SocialConnectAuthenticator;
use Symfony\Config\SecurityConfig;

return static function (SecurityConfig $security): void {
    $security->enableAuthenticatorManager(true);
    // ....

    // allow authentication using a form or HTTP basic
    $mainFirewall = $security->firewall('main');
    $mainFirewall
        ->formLogin()
        ->customAuthenticators([SocialConnectAuthenticator::class])

        // configure the form authentication as the entry point for unauthenticated users
        ->entryPoint('form_login');
    ;
};
```

Example 4 (yaml):

```yaml
# config/packages/security.yaml
security:
  # ...
  firewalls:
    api:
      pattern: ^/api/
      custom_authenticators:
        - App\Security\ApiTokenAuthenticator
    main:
      lazy: true
      form_login: ~

  access_control:
    - { path: "^/login", roles: PUBLIC_ACCESS }
    - { path: "^/api", roles: ROLE_API_USER }
    - { path: "^/", roles: ROLE_USER }
```

---

## The Ldap Component

**URL:** https://symfony.com/doc/7.4/components/ldap.html

**Contents:**

- The Ldap Component
- Installation
- Usage
- Creating or Updating Entries
  - Batch Updating

The Ldap component provides a means to connect to an LDAP server (OpenLDAP or Active Directory).

If you install this component outside of a Symfony application, you must require the vendor/autoload.php file in your code to enable the class autoloading mechanism provided by Composer. Read this article for more details.

The Ldap class provides methods to authenticate and query against an LDAP server.

The Ldap class uses an AdapterInterface to communicate with an LDAP server. The adapter for PHP's built-in LDAP extension, for example, can be configured using the following options:

For example, to connect to a start-TLS secured LDAP server:

Or you could directly specify a connection string:

The bind() method authenticates a previously configured connection using both the distinguished name (DN) and the password of a user:

When the LDAP server allows unauthenticated binds, a blank password will always be valid.

You can also use the saslBind() method for binding to an LDAP server using SASL:

After binding to the LDAP server, you can use the whoami() method to get the distinguished name (DN) of the authenticated and authorized user.

The saslBind() and whoami() methods were introduced in Symfony 7.2.

Once bound (or if you enabled anonymous authentication on your LDAP server), you may query the LDAP server using the query() method:

By default, LDAP entries are lazy-loaded. If you wish to fetch all entries in a single call and do something with the results' array, you may use the toArray() method:

By default, LDAP queries use the Symfony\Component\Ldap\Adapter\QueryInterface::SCOPE_SUB scope, which corresponds to the LDAP_SCOPE_SUBTREE scope of the ldap_search function. You can also use SCOPE_BASE (related to the LDAP_SCOPE_BASE scope of ldap_read) and SCOPE_ONE (related to the LDAP_SCOPE_ONELEVEL scope of ldap_list):

Use the filter option to only retrieve some specific attributes:

The Ldap component provides means to create new LDAP entries, update or even delete existing ones:

Use the entry manager's applyOperations() method to update multiple attributes at once:

Possible operation types are LDAP_MODIFY_BATCH_ADD, LDAP_MODIFY_BATCH_REMOVE, LDAP_MODIFY_BATCH_REMOVE_ALL, LDAP_MODIFY_BATCH_REPLACE. Parameter $values must be NULL when using LDAP_MODIFY_BATCH_REMOVE_ALL operation type.

Code consumes server resources. Blackfire tells you how

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/ldap
```

Example 2 (php):

```php
use Symfony\Component\Ldap\Ldap;

$ldap = Ldap::create('ext_ldap', [
    'host' => 'my-server',
    'encryption' => 'ssl',
]);
```

Example 3 (php):

```php
use Symfony\Component\Ldap\Ldap;

$ldap = Ldap::create('ext_ldap', ['connection_string' => 'ldaps://my-server:636']);
```

Example 4 (php):

```php
use Symfony\Component\Ldap\Ldap;
// ...

$ldap->bind($dn, $password);
```

---
