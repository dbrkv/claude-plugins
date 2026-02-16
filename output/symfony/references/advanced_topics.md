# Symfony - Advanced Topics

**Pages:** 35

---

## Console Commands

**URL:** https://symfony.com/doc/7.4/console.html

**Contents:**

- Console Commands
- Running Commands
  - APP_ENV & APP_DEBUG
  - Console Completion
- Creating a Command
  - Running the Command
  - Command Aliases
- Console Output
  - Output Sections
- Console Input

The Symfony framework provides lots of commands through the bin/console script (e.g. the well-known bin/console cache:clear command). These commands are created with the Console component. You can also use it to create your own commands.

Each Symfony application comes with a large set of commands. You can use the list command to view all available commands in the application:

list is the default command, so running php bin/console is the same.

If you find the command you need, you can run it with the --help option to view the command's documentation:

--help is one of the built-in global options from the Console component, which are available for all commands, including those you can create. To learn more about them, you can read this section.

Console commands run in the environment defined in the APP_ENV variable of the .env file, which is dev by default. It also reads the APP_DEBUG value to turn "debug" mode on or off (it defaults to 1, which is on).

To run the command in another environment or debug mode, edit the value of APP_ENV and APP_DEBUG. You can also define this env vars when running the command, for instance:

If you are using the Bash, Zsh or Fish shell, you can install Symfony's completion script to get auto completion when typing commands in the terminal. All commands support name and option completion, and some can even complete values.

First, you have to install the completion script once. Run bin/console completion --help for the installation instructions for your shell.

When using Bash, make sure you installed and setup the "bash completion" package for your OS (typically named bash-completion).

After installing and restarting your terminal, you're all set to use completion (by default, by pressing the Tab key).

Many PHP tools are built using the Symfony Console component (e.g. Composer, PHPstan and Behat). If they are using version 5.4 or higher, you can also install their completion script to enable console completion:

If you are using the Symfony CLI tool, follow these instructions to enable autocompletion.

Commands are defined in classes and auto-registered using the #[AsCommand] attribute. For example, you may want a command to create a user:

Support for invokable commands that don't extend the base Command class was introduced in Symfony 7.3

If you can't use PHP attributes, register the command as a service and tag it with the console.command tag. If you're using the default services.yaml configuration, this is already done for you, thanks to autoconfiguration.

You can also use #[AsCommand] to add a description, usage exampless, and longer help text for the command:

The feature to define usage examples in the #[AsCommand] attribute was introduced in Symfony 7.4.

Additionally, you can extend the Command class to leverage advanced features like lifecycle hooks (e.g. initialize() and and interact()):

After configuring and registering the command, you can run it in the terminal:

As you might expect, this command will do nothing as you didn't write any logic yet. Add your own logic inside the \_\_invoke() method.

You can define alternative names (aliases) for a command directly in its name using a pipe (|) separator. The first name in the list becomes the actual command name; the others are aliases that can also be used to run the command:

The ability to define aliases through the command name was introduced in Symfony 7.4.

The \_\_invoke() method has access to the output stream to write messages to the console:

Now, try executing the command:

The regular console output can be divided into multiple independent regions called "output sections". Create one or more of these sections when you need to clear and overwrite the output information.

Sections are created with the ConsoleOutput::section() method, which returns an instance of ConsoleSectionOutput:

A new line is appended automatically when displaying information in a section.

Output sections let you manipulate the Console output in advanced ways, such as displaying multiple progress bars which are updated independently and appending rows to tables that have already been rendered.

Terminals only allow overwriting the visible content, so you must take into account the console height when trying to write/overwrite section contents.

Use input options or arguments to pass information to the command:

Now, you can pass the username to the command:

Read Console Input (Arguments & Options) for more information about console options and arguments.

To actually create a new user, the command has to access some services. Since your command is already registered as a service, you can use normal dependency injection. Imagine you have a App\Service\UserManager service that you want to access:

Commands have three lifecycle methods that are invoked when running the command:

Symfony provides several tools to help you test your commands. The most useful one is the CommandTester class. It uses special input and output classes to ease testing without a real console:

If you are using a single-command application, call setAutoExit(false) on it to get the command result in CommandTester.

You can also test a whole console application by using ApplicationTester.

When testing commands using the CommandTester class, console events are not dispatched. If you need to test those events, use the ApplicationTester instead.

When testing commands using the ApplicationTester class, don't forget to disable the auto exit flag:

When testing InputOption::VALUE_NONE command options, you must pass true to them:

When using the Console component in a standalone project, use Application and extend the normal \PHPUnit\Framework\TestCase.

When testing your commands, it could be useful to understand how your command reacts on different settings like the width and the height of the terminal, or even the color mode being used. You have access to such information thanks to the Terminal class:

Whenever an exception is thrown while running commands, Symfony adds a log message for it including the entire failing command. In addition, Symfony registers an event subscriber to listen to the ConsoleEvents::TERMINATE event and adds a log message whenever a command doesn't finish with the 0 exit status.

When a command is running, many events are dispatched, one of them allows you to react to signals, read more in this section.

Symfony allows you to profile the execution of any command, including yours. First, make sure that the debug mode and the profiler are enabled. Then, add the --profile option when running the command:

Symfony will now collect data about the command execution, which is helpful to debug errors or check other issues. When the command execution is over, the profile is accessible through the web page of the profiler.

If you run the command in verbose mode (adding the -v option), Symfony will display in the output a clickable link to the command profile (if your terminal supports links). If you run it in debug verbosity (-vvv) you'll also see the time and memory consumed by the command.

The collection of dump() calls by the profiler when using the --profile option was introduced in Symfony 7.4. Without this option, dumps are displayed directly in the console output.

When profiling the messenger:consume command from the Messenger component, add the --no-reset option to the command or you won't get any profile. Moreover, consider using the --limit option to only process a few messages to make the profile more readable in the profiler.

The console component also contains a set of "helpers" - different small tools capable of helping you with different tasks:

Symfony Code Performance Profiling

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (yaml):

```yaml
$ php bin/console list
...
Available commands:
  about             Display information about the current project
  completion        Dump the shell completion script
  help              Display help for a command
  list              List commands
  assets
  assets:install    Install bundle's web assets under a public directory
  cache
  cache:clear       Clear the cache
...
```

Example 2 (unknown):

```unknown
$ php bin/console assets:install --help
```

Example 3 (markdown):

```markdown
# clears the cache for the prod environment

$ APP_ENV=prod php bin/console cache:clear
```

Example 4 (unknown):

```unknown
$ php vendor/bin/phpstan completion --help
$ composer completion --help
```

---

## Validation

**URL:** https://symfony.com/doc/7.4/validation.html

**Contents:**

- Validation
- Installation
- The Basics of Validation
  - Using the Validator Service
  - Validation Callables
- Constraints
  - Supported Constraints
  - Basic Constraints
  - String Constraints
  - Comparison Constraints

Validation is a very common task in web applications. Data entered in forms needs to be validated. Data also needs to be validated before it is written into a database or passed to a web service.

Symfony provides a Validator component to handle this for you. This component is based on the JSR303 Bean Validation specification.

In applications using Symfony Flex, run this command to install the validator before using it:

If your application doesn't use Symfony Flex, you might need to do some manual configuration to enable validation. Check out the Validation configuration reference.

The best way to understand validation is to see it in action. To start, suppose you've created a plain-old-PHP object that you need to use somewhere in your application:

So far, this is an ordinary class that serves some purpose inside your application. The goal of validation is to tell you if the data of an object is valid. For this to work, you'll configure a list of rules (called constraints) that the object must follow in order to be valid. These rules are usually defined using PHP code or attributes but they can also be defined as .yaml or .xml files inside the config/validator/ directory.

For example, to indicate that the $name property must not be empty, add the following:

Adding this configuration by itself does not yet guarantee that the value will not be blank; you can still set it to a blank value if you want. To actually guarantee that the value adheres to the constraint, the object must be passed to the validator service to be checked.

Symfony's validator uses PHP reflection, as well as "getter" methods, to get the value of any property, so they can be public, private or protected (see Validation).

Symfony provides a JSON schema for validation mapping files that enables autocompletion and validation in IDEs like PhpStorm. Add the following $schema key at the beginning of your YAML files to enable this feature:

The JSON schema for validation mapping files was introduced in Symfony 7.4.

Next, to actually validate an Author object, use the validate() method on the validator service (which implements ValidatorInterface). The job of the validator is to read the constraints (i.e. rules) of a class and verify if the data on the object satisfies those constraints. If validation fails, a non-empty list of errors (ConstraintViolationList class) is returned. Take this simple example from inside a controller:

If the $name property is empty, you will see the following error message:

If you insert a value into the name property, the happy success message will appear.

Most of the time, you won't interact directly with the validator service or need to worry about printing out the errors. Most of the time, you'll use validation indirectly when handling submitted form data. For more information, see how to validate Symfony forms.

You could also pass the collection of errors into a template:

Inside the template, you can output the list of errors exactly as needed:

Each validation error (called a "constraint violation"), is represented by a ConstraintViolation object. This object allows you, among other things, to get the constraint that caused this violation thanks to the ConstraintViolation::getConstraint() method.

The Validation also allows you to create a closure to validate values against a set of constraints (useful for example when validating Console command answers or when validating OptionsResolver values):

The validator is designed to validate objects against constraints (i.e. rules). In order to validate an object, simply map one or more constraints to its class and then pass it to the validator service.

Internally, a constraint is a PHP object that makes an assertive statement. In real life, a constraint could be: 'The cake must not be burned'. In Symfony, constraints are similar: they are assertions that a condition is true. Given a value, a constraint will tell you if that value adheres to the rules of the constraint.

Symfony packages many of the most commonly-needed constraints:

These are the basic constraints: use them to assert very basic things about the value of properties or the return value of methods on your object.

You can also create your own custom constraints. This topic is covered in the How to Create a Custom Validation Constraint article.

Some constraints, like NotBlank, are simple whereas others, like the Choice constraint, have several configuration options available. Suppose that the Author class has another property called genre that defines the literature genre mostly associated with the author, which can be set to either "fiction" or "non-fiction":

Constraints can be defined while building the form via the constraints option of the form fields:

Constraints can be applied to a class property (e.g. name), a getter method (e.g. getFullName()) or an entire class. Property constraints are the most common and easy to use. Getter constraints allow you to specify more complex validation rules. Finally, class constraints are intended for scenarios where you want to validate a class as a whole.

Validating class properties is the most basic validation technique. Symfony allows you to validate private, protected or public properties. The next listing shows you how to configure the $firstName property of an Author class to have at least 3 characters.

The validator will use a value null if a typed property is uninitialized. This can cause unexpected behavior if the property holds a value when initialized. In order to avoid this, make sure all properties are initialized before validating them.

Constraints can also be applied to the return value of a method. Symfony allows you to add a constraint to any private, protected or public method whose name starts with "get", "is" or "has". In this guide, these types of methods are referred to as "getters".

The benefit of this technique is that it allows you to validate your object dynamically. For example, suppose you want to make sure that a password field doesn't match the first name of the user (for security reasons). You can do this by creating an isPasswordSafe() method, and then asserting that this method must return true:

Now, create the isPasswordSafe() method and include the logic you need:

The keen-eyed among you will have noticed that the prefix of the getter ("get", "is" or "has") is omitted in the mappings for the YAML, XML and PHP formats. This allows you to move the constraint to a property with the same name later (or vice versa) without changing your validation logic.

Some constraints apply to the entire class being validated. For example, the Callback constraint is a generic constraint that's applied to the class itself. When that class is validated, methods specified by that constraint are simply executed so that each can provide more custom validation.

When you validate an object that extends another class, the validator automatically validates constraints defined in the parent class as well.

The constraints defined in the parent properties will be applied to the child properties even if the child properties override those constraints. Symfony will always merge the parent constraints for each property.

You can't change this behavior, but you can overcome it by defining the parent and the child constraints in different validation groups and then select the appropriate group when validating each object.

Sometimes you may want to add or override validation constraints on a class you cannot modify (for example, a model coming from a third party library or a bundle).

Suppose you use a third party Product class that validates the name property with a minimum length of 2, but in your application you want to enforce a minimum of 10 characters.

To do this, create a separate class and use the #[ExtendsValidationFor] attribute to tell the Validator which class should receive these constraints. Your new class name is irrelevant and the class is typically made abstract to make it clear it is never instantiated:

The constraints defined in this class are applied to the target class (Product) as if they were defined there.

You can only define constraints for properties that exist on the target class. Otherwise, a MappingException is thrown.

The #[ExtendsValidationFor] attribute was introduced in Symfony 7.4.

Use the debug:validator command to list the validation constraints of a given class:

You can also validate all the classes stored in a given directory:

The Symfony validator is a powerful tool that can be leveraged to guarantee that the data of any object is "valid". The power behind validation lies in "constraints", which are rules that you can apply to properties or getter methods of your object. And while you'll most commonly use the validation framework indirectly when using forms, remember that it can be used anywhere to validate any object.

Code consumes server resources. Blackfire tells you how

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/validator
```

Example 2 (php):

```php
// src/Entity/Author.php
namespace App\Entity;

class Author
{
    private string $name;
}
```

Example 3 (php):

```php
// src/Entity/Author.php
namespace App\Entity;

// ...
use Symfony\Component\Validator\Constraints as Assert;

class Author
{
    #[Assert\NotBlank]
    private string $name;
}
```

Example 4 (markdown):

```markdown
# config/validator/validation.yaml

App\Entity\Author:
properties:
name: - NotBlank: ~
```

---

## Creating and Sending Notifications

**URL:** https://symfony.com/doc/7.4/notifier.html

**Contents:**

- Creating and Sending Notifications
- Installation
- Channels
  - SMS Channel
  - Chat Channel
  - Email Channel
  - Push Channel
  - Desktop Channel
  - Configure to use Failover or Round-Robin Transports
- Creating & Sending Notifications

Current web applications use many different channels to send messages to the users (e.g. SMS, Slack messages, emails, push notifications, etc.). The Notifier component in Symfony is an abstraction on top of all these channels. It provides a dynamic way to manage how the messages are sent. Get the Notifier installed using:

Channels refer to the different mediums through which notifications can be delivered. These channels include email, SMS, chat services, push notifications, etc. Each channel can integrate with different providers (e.g. Slack or Twilio SMS) by using transports.

The notifier component supports the following channels:

The Desktop channel was introduced in Symfony 7.2.

The SMS channel uses Texter classes to send SMS messages to mobile phones. This feature requires subscribing to a third-party service that sends SMS messages. Symfony provides integration with a couple popular SMS services:

If any of the DSN values contains any character considered special in a URI (such as : / ? # [ ] @ ! $ & ' ( ) \* + , ; =), you must encode them. See RFC 3986 for the full list of reserved characters or use the urlencode function to encode them.

Use Symfony configuration secrets to securely store your API tokens.

Some third party transports, when using the API, support status callbacks via webhooks. See the Webhook documentation for more details.

The Smsbox, SmsSluzba, SMSense, LOX24 and Unifonic integrations were introduced in Symfony 7.1.

The Primotexto, Sipgate and Sweego integrations were introduced in Symfony 7.2.

Webhook support for the Brevo integration was introduced in Symfony 7.3. The extra properties in SentMessage for AllMySms and OvhCloud providers were introduced in Symfony 7.3 too.

The Sms77 integration is deprecated since Symfony 7.1, use the Seven.io integration instead.

To enable a texter, add the correct DSN in your .env file and configure the texter_transports:

The TexterInterface class allows you to send SMS messages:

The send() method returns a variable of type SentMessage which provides information such as the message ID and the original message contents.

If any of the DSN values contains any character considered special in a URI (such as : / ? # [ ] @ ! $ & ' ( ) \* + , ; =), you must encode them. See RFC 3986 for the full list of reserved characters or use the urlencode function to encode them.

The chat channel is used to send chat messages to users by using Chatter classes. Symfony provides integration with these chat services:

The Bluesky integration was introduced in Symfony 7.1.

The LINE Bot integration was introduced in Symfony 7.2.

The Gitter integration was removed in Symfony 7.2 because that service no longer provides an API.

The Matrix integration was introduced in Symfony 7.3.

By default, if you have the Messenger component installed, the notifications will be sent through the MessageBus. If you don't have a message consumer running, messages will never be sent.

To change this behavior, add the following configuration to send messages directly via the transport:

Chatters are configured using the chatter_transports setting:

The ChatterInterface class allows you to send messages to chat services:

The send() method returns a variable of type SentMessage which provides information such as the message ID and the original message contents.

The email channel uses the Symfony Mailer to send notifications using the special NotificationEmail. It is required to install the Twig bridge along with the Inky and CSS Inliner Twig extensions:

After this, configure the mailer. You can also set the default "from" email address that should be used to send the notification emails:

If any of the DSN values contains any character considered special in a URI (such as : / ? # [ ] @ ! $ & ' ( ) \* + , ; =), you must encode them. See RFC 3986 for the full list of reserved characters or use the urlencode function to encode them.

The push channel is used to send notifications to users by using Texter classes. Symfony provides integration with these push services:

To enable a texter, add the correct DSN in your .env file and configure the texter_transports:

The Pushy integration was introduced in Symfony 7.1.

The desktop channel is used to display local desktop notifications on the same host machine using Texter classes. Currently, Symfony is integrated with the following providers:

The JoliNotif bridge was introduced in Symfony 7.2.

If you are using Symfony Flex, installing that package will also create the necessary environment variable and configuration. Otherwise, you'll need to add the following manually:

Now you can send notifications to your desktop as follows:

These notifications can be customized further, and depending on your operating system, they may support features like custom sounds, icons, and more:

Besides configuring one or more separate transports, you can also use the special || and && characters to implement a failover or round-robin transport:

To send a notification, autowire the NotifierInterface (service ID notifier). This class has a send() method that allows you to send a Notification to a Recipient:

The Notification is created by using two arguments: the subject and channels. The channels specify which channel (or transport) should be used to send the notification. For instance, ['email', 'sms'] will send both an email and sms notification to the user.

The default notification also has a content() and emoji() method to set the notification content and icon.

Symfony provides the following recipients:

Instead of specifying the target channels on creation, Symfony also allows you to use notification importance levels. Update the configuration to specify what channels should be used for specific levels (using channel_policy):

Now, whenever the notification's importance is set to "high", it will be sent using the Slack transport:

You can extend the Notification or Recipient base classes to customize their behavior. For instance, you can overwrite the getChannels() method to only return sms if the invoice price is very high and the recipient has a phone number:

Each channel has its own notification interface that you can implement to customize the notification message. For instance, if you want to modify the message based on the chat service, implement ChatNotificationInterface and its asChatMessage() method:

The SmsNotificationInterface, EmailNotificationInterface, PushNotificationInterface and DesktopNotificationInterface also exists to modify messages sent to those channels.

The default behavior for browser channel notifications is to add a flash message with notification as its key.

However, you might prefer to map the importance level of the notification to the type of flash message, so you can tweak their style.

You can do that by overriding the default notifier.flash_message_importance_mapper service with your own implementation of FlashMessageImportanceMapperInterface where you can provide your own "importance" to "alert level" mapping.

Symfony currently provides an implementation for the Bootstrap CSS framework's typical alert levels, which you can implement immediately using:

Symfony provides a NotificationAssertionsTrait which provide useful methods for testing your Notifier implementation. You can benefit from this class by using it directly or extending the KernelTestCase.

See testing documentation for the list of available assertions.

While developing (or testing), you may want to disable delivery of notifications entirely. You can do this by forcing Notifier to use the NullTransport for all configured texter and chatter transports only in the dev (and/or test) environment:

The Transport class of the Notifier component allows you to optionally hook into the lifecycle via events.

Typical Purposes: Doing something before the message is sent (like logging which message is going to be sent, or displaying something about the event to be executed.

Just before sending the message, the event class MessageEvent is dispatched. Listeners receive a MessageEvent event:

Typical Purposes: Doing something before the exception is thrown (Retry to send the message or log additional information).

Whenever an exception is thrown while sending the message, the event class FailedMessageEvent is dispatched. A listener can do anything useful before the exception is thrown.

Listeners receive a FailedMessageEvent event:

Typical Purposes: To perform some action when the message is successfully sent (like retrieve the id returned when the message is sent).

After the message has been successfully sent, the event class SentMessageEvent is dispatched. Listeners receive a SentMessageEvent event:

Symfony Code Performance Profiling

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/notifier
```

Example 2 (markdown):

```markdown
# .env

TWILIO_DSN=twilio://SID:TOKEN@default?from=FROM
```

Example 3 (yaml):

```yaml
# config/packages/notifier.yaml
framework:
  notifier:
    texter_transports:
      twilio: "%env(TWILIO_DSN)%"
```

Example 4 (xml):

```xml
<!-- config/packages/notifier.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <framework:config>
        <framework:notifier>
            <framework:texter-transport name="twilio">
                %env(TWILIO_DSN)%
            </framework:texter-transport>
        </framework:notifier>
    </framework:config>
</container>
```

---

## Validation Constraints Reference

**URL:** https://symfony.com/doc/7.4/reference/constraints.html

**Contents:**

- Validation Constraints Reference
- Supported Constraints
  - Basic Constraints
  - String Constraints
  - Comparison Constraints
  - Number Constraints
  - Date Constraints
  - Choice Constraints
  - File Constraints
  - Financial and other Number Constraints

The Validator is designed to validate objects against constraints. In real life, a constraint could be: "The cake must not be burned". In Symfony, constraints are similar: They are assertions that a condition is true.

The following constraints are natively available in Symfony:

These are the basic constraints: use them to assert very basic things about the value of properties or the return value of methods on your object.

Get your Sylius expertise recognized

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

---

## How to Validate Raw Values (Scalar Values and Arrays)

**URL:** https://symfony.com/doc/7.4/validation/raw_values.html

**Contents:**

- How to Validate Raw Values (Scalar Values and Arrays)

Usually you will be validating entire objects. But sometimes, you want to validate a simple value - like to verify that a string is a valid email address. From inside a controller, it looks like this:

By calling validate() on the validator, you can pass in a raw value and the constraint object that you want to validate that value against. A full list of the available constraints - as well as the full class name for each constraint - is available in the constraints reference section.

Validation of arrays is possible using the Collection constraint:

The validate() method returns a ConstraintViolationList object, which acts like an array of errors. Each error in the collection is a ConstraintViolation object, which holds the error message on its getMessage() method.

When using groups with the Collection constraint, be sure to use the Optional constraint when appropriate as explained in its reference documentation.

Code consumes server resources. Blackfire tells you how

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):

```php
// ...
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

// ...
public function addEmail(string $email, ValidatorInterface $validator): void
{
    $emailConstraint = new Assert\Email();
    // all constraint "options" can be set this way
    $emailConstraint->message = 'Invalid email address';

    // use the validator to validate the value
    $errors = $validator->validate(
        $email,
        $emailConstraint
    );

    if (!$errors->count()) {
        // ... this IS a valid email address, do something
    } else {
        // this is *not* a valid email address
        $errorMessage = $errors[0]->getMessage();

        // ... do something with the error
    }

    // ...
}
```

Example 2 (php):

```php
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validation;

$validator = Validation::createValidator();

$input = [
    'name' => [
        'first_name' => 'Fabien',
        'last_name' => 'Potencier',
    ],
    'email' => 'test@email.tld',
    'simple' => 'hello',
    'eye_color' => 3,
    'file' => null,
    'password' => 'test',
    'tags' => [
        [
            'slug' => 'symfony_doc',
            'label' => 'symfony doc',
        ],
    ],
];

$groups = new Assert\GroupSequence(groups: ['Default', 'custom']);

$constraint = new Assert\Collection(fields: [
    // the keys correspond to the keys in the input array
    'name' => new Assert\Collection(fields: [
        'first_name' => new Assert\Length(min: 101),
        'last_name' => new Assert\Length(min: 1),
    ]),
    'email' => new Assert\Email(),
    'simple' => new Assert\Length(min: 102),
    'eye_color' => new Assert\Choice(choices: [3, 4]),
    'file' => new Assert\File(),
    'password' => new Assert\Length(min: 60),
    'tags' => new Assert\Optional(constraints: [
        new Assert\Type(type: 'array'),
        new Assert\Count(min: 1),
        new Assert\All([
            new Assert\Collection(constraints: [
                'slug' => [
                    new Assert\NotBlank(),
                    new Assert\Type(['type' => 'string']),
                ],
                'label' => [
                    new Assert\NotBlank(),
                ],
            ]),
            new CustomUniqueTagValidator(groups: ['custom']),
        ]),
    ]),
]);

$violations = $validator->validate($input, $constraint, $groups);
```

---

## How to Configure Monolog to Display Console Messages

**URL:** https://symfony.com/doc/7.4/logging/monolog_console.html

**Contents:**

- How to Configure Monolog to Display Console Messages
- Limiting Output to Interactive Mode

It is possible to use the console to print messages for certain verbosity levels using the OutputInterface instance that is passed when a command is run.

When a lot of logging has to happen, it's cumbersome to print information depending on the verbosity settings (-v, -vv, -vvv) because the calls need to be wrapped in conditions. For example:

Instead of using these semantic methods to test for each of the verbosity levels, the MonologBridge provides a ConsoleHandler that listens to console events and writes log messages to the console output depending on the current log level and the console verbosity.

The example above could then be rewritten as:

Depending on the verbosity level that the command is run in and the user's configuration (see below), these messages may or may not be displayed to the console. If they are displayed, they are time-stamped and colored appropriately. Additionally, error logs are written to the error output (php://stderr). There is no need to conditionally handle the verbosity settings anymore.

The Monolog console handler is enabled by default:

In this configuration, console is an arbitrary handler name and can be any string. The type: console option selects the ConsoleHandler, which writes log messages to the command output.

The channels option uses the ! prefix to exclude specific channels. The console channel is excluded to reduce noise. This is the channel where Symfony logs command lifecycle events (e.g. Command "{command}" exited with code "{code}"). Excluding this channel does not affect any log messages you write yourself inside your commands, which use different channels and will still appear normally.

Now, log messages will be shown on the console based on the log levels and verbosity. By default (normal verbosity level), warnings and higher will be shown. But in full verbosity mode, all messages will be shown.

In automated environments like CI/CD pipelines or cron jobs, console log output may interfere with command output or create unnecessary clutter. You can configure the console handler to only output logs when the console is interactive:

When interactive_only is set to true, the console handler will only output logs and prevent propagation to other handlers when the command is running in an interactive terminal. In non-interactive mode (e.g., when using the --no-interaction option or in automated scripts), logs will be propagated to other handlers instead.

The interactive_only option was introduced in Symfony 7.4.

Code consumes server resources. Blackfire tells you how

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):

```php
use Symfony\Component\Console\Output\OutputInterface;

public function __invoke(OutputInterface $output): int
{
    if ($output->isDebug()) {
        $output->writeln('Some info');
    }

    if ($output->isVerbose()) {
        $output->writeln('Some more info');
    }

    // ...
}
```

Example 2 (php):

```php
// src/Command/MyCommand.php
namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;

#[AsCommand(name: 'app:my-command')]
class MyCommand
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke(): int
    {
        $this->logger->debug('Some info');
        $this->logger->notice('Some more info');

        return Command::SUCCESS;
    }
}
```

Example 3 (yaml):

```yaml
# config/packages/dev/monolog.yaml
monolog:
  handlers:
    # ...
    console:
      type: console
      process_psr_3_messages: false
      channels: ["!event", "!doctrine", "!console"]

      # optionally configure the mapping between verbosity levels and log levels
      # verbosity_levels:
      #     VERBOSITY_NORMAL: NOTICE
```

Example 4 (xml):

```xml
<!-- config/packages/dev/monolog.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:monolog="http://symfony.com/schema/dic/monolog"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd">

    <monolog:config>
        <!-- ... -->

        <monolog:handler name="console" type="console" process-psr-3-messages="false">
            <monolog:channels>
                <monolog:channel>!event</monolog:channel>
                <monolog:channel>!doctrine</monolog:channel>
                <monolog:channel>!console</monolog:channel>
            </monolog:channels>
        </monolog:handler>
    </monolog:config>
</container>
```

---

## The Console Component

**URL:** https://symfony.com/doc/7.4/components/console.html

**Contents:**

- The Console Component
- Installation
- Creating a Console Application
- Learn more

The Console component eases the creation of beautiful and testable command line interfaces.

The Console component allows you to create command-line commands. Your console commands can be used for any recurring task, such as cronjobs, imports, or other batch jobs.

If you install this component outside of a Symfony application, you must require the vendor/autoload.php file in your code to enable the class autoloading mechanism provided by Composer. Read this article for more details.

This article explains how to use the Console features as an independent component in any PHP application. Read the Console Commands article to learn about how to use it in Symfony applications.

First, you need to create a PHP script to define the console application:

Then, you can register the commands using addCommand():

The addCommand() method was introduced in Symfony 7.4. In earlier versions, you had to use the add() method of the same class.

You can also register inline commands and define their behavior thanks to the Command::setCode() method:

This is useful when creating a single-command application.

See the Console Commands article for information about how to create commands.

Measure & Improve Symfony Code Performance

Save your teams and projects before they sink

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/console
```

Example 2 (php):

```php
#!/usr/bin/env php
<?php
// application.php

require __DIR__.'/vendor/autoload.php';

use Symfony\Component\Console\Application;

$application = new Application();

// ... register commands

$application->run();
```

Example 3 (php):

```php
// ...
$application->addCommand(new GenerateAdminCommand());
```

Example 4 (php):

```php
// ...
$application->register('generate-admin')
    ->addArgument('username', InputArgument::REQUIRED)
    ->setCode(function (InputInterface $input, OutputInterface $output): int {
        // ...

        return Command::SUCCESS;
    });
```

---

## Console Input (Arguments & Options)

**URL:** https://symfony.com/doc/7.4/console/input.html

**Contents:**

- Console Input (Arguments & Options)
- Using Command Arguments
  - Using Arguments in Invokable Commands
  - Using the Classic configure() Method
- Using Command Options
  - Using Options in Invokable Commands
  - Using the Classic addOption() Method
- Mapping Input to Objects
  - Nesting Input DTOs
  - Using Property Hooks for Normalization

The most interesting part of the commands are the arguments and options that you can make available. These arguments and options allow you to pass dynamic information from the terminal to the command.

Arguments are the strings - separated by spaces - that come after the command name itself. They are ordered, and can be optional or required.

In invokable commands, use the Argument attribute to define arguments directly in the \_\_invoke() method parameters:

The Argument attribute accepts the following parameters:

The #[Argument] and #[Option] attributes were introduced in Symfony 7.3.

The argument mode (required, optional, array) is inferred from the parameter type:

If you prefer the classic approach, or need to extend the Command class, you can use the addArgument() method in the configure() method. For example, to add an optional last_name argument to the command and make the name argument required:

You now have access to a last_name argument in your command:

The command can now be used in either of the following ways:

It is also possible to let an argument take a list of values (imagine you want to greet all your friends). Only the last argument can be a list:

To use this, specify as many names as you want:

You can access the names argument as an array:

There are three argument variants you can use:

You can combine IS_ARRAY with REQUIRED or OPTIONAL like this:

Unlike arguments, options are not ordered (meaning you can specify them in any order) and are specified with two dashes (e.g. --yell). Options are always optional, and can be setup to accept a value (e.g. --dir=src) or as a boolean flag without a value (e.g. --yell).

In invokable commands, use the Option attribute to define options directly in the \_\_invoke() method parameters:

The Option attribute accepts the following parameters:

The option mode is inferred from the parameter type and default value:

Boolean flag (VALUE_NONE): bool type with default false. Usage: --yell sets the value to true:

Negatable flag (VALUE_NEGATABLE): bool type with default true or nullable ?bool with default null. Usage: --yell or --no-yell:

Value required (VALUE_REQUIRED): string, int or float types:

Array of values (VALUE_IS_ARRAY): array type. Usage: --role=ADMIN --role=USER:

Value optional (VALUE_OPTIONAL): Union types string|bool, int|bool, or float|bool with default false. Usage: --output (returns true) or --output=file.txt (returns 'file.txt'):

The #[Option] attribute enforces validation rules on type and default value combinations. See Option Attribute Constraints for the complete list of rules and examples.

If you prefer the classic approach, or need to extend the Command class, you can use the addOption() method in the configure() method. For example, add a new option to the command that can be used to specify how many times in a row the message should be printed:

Next, use this in the command to print the message multiple times:

Now, when you run the command, you can optionally specify a --iterations flag:

You can also declare a one-letter shortcut that you can call with a single dash, like -i:

Note that to comply with the docopt standard, long options can specify their values after a whitespace or an = sign (e.g. --iterations 5 or --iterations=5), but short options can only use whitespaces or no separation at all (e.g. -i 5 or -i5).

While it is possible to separate an option from its value with a whitespace, using this form leads to an ambiguity should the option appear before the command name. For example, php bin/console --iterations 5 app:greet Fabien is ambiguous; Symfony would interpret 5 as the command name. To avoid this situation, always place options after the command name, or avoid using a space to separate the option name from its value.

There are five option variants you can use:

You need to combine VALUE_IS_ARRAY with VALUE_REQUIRED or VALUE_OPTIONAL like this:

When a command has many arguments and options, the \_\_invoke() method can become cluttered. To better organize the input, you can use the MapInput attribute to group arguments and options into a dedicated class (a Data Transfer Object, or DTO):

Then, use the #[MapInput] attribute in your command to receive this DTO:

The #[MapInput] attribute was introduced in Symfony 7.4.

The DTO class must have at least one public property with an #[Argument] or #[Option] attribute. Private, protected, and static properties are ignored. The same rules for argument and option types described earlier in this article apply to DTO properties.

DTOs are instantiated without calling their constructor and values are assigned directly to public properties. This means any logic in the constructor (such as initialization) will not run. If you need to transform or validate input values, use property hooks instead.

You can compose input classes by nesting DTOs. This is useful when you want to group related arguments and options, or reuse common input definitions across multiple commands:

Then, access nested properties in your command:

PHP provides property hooks, which you can use to normalize input values as they are assigned to the DTO:

With this setup, when the command input is resolved, the email is lowercased and trimmed, and roles are uppercased.

There is nothing forbidding you to create a command with an option that optionally accepts a value, but it's a bit tricky. Consider this example:

This option can be used in 3 ways: greet --yell, greet --yell=louder, and greet. However, it's hard to distinguish between passing the option without a value (greet --yell) and not passing the option (greet).

To solve this issue, you have to set the option's default value to false:

Now it's possible to differentiate between not passing the option and not passing any value for it:

The above code can be simplified as follows because false !== null:

Symfony provides a getRawTokens() method to fetch the raw input that was passed to the command. This is useful if you want to parse the input yourself or when you need to pass the input to another command without having to worry about the number of arguments or options:

The getRawTokens() method was introduced in Symfony 7.1.

If Console completion is installed, command and option names will be auto completed by the shell. However, you can also implement value completion for the input in your commands. For instance, you may want to complete all usernames from the database in the name argument of your greet command.

When using the #[Argument] or #[Option] attributes in invokable commands, use the suggestedValues parameter to provide completion values:

You can remove the static keyword from the suggestion method to access instance properties. In that case, the command will call the method non-statically, allowing you to return dynamic values based on services injected through the constructor:

When using the classic configure() method, use the 5th argument of addArgument() or the 6th argument of addOption():

That's all you need! Assuming users "Fabien" and "Fabrice" exist, pressing tab after typing app:greet Fa will give you these names as a suggestion.

The shell script is able to handle huge amounts of suggestions and will automatically filter the suggested values based on the existing input from the user. You do not have to implement any filter logic in the command.

You may use CompletionInput::getCompletionValue() to get the current input if that helps improving performance (e.g. by reducing the number of rows fetched from the database).

The Console component comes with a special CommandCompletionTester class to help you unit test the completion logic:

The Console component adds some predefined options to all commands:

The --silent option was introduced in Symfony 7.2.

When using the FrameworkBundle, two more options are predefined:

So your custom commands can use them too out-of-the-box.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Make sure your project is risk free

**Examples:**

Example 1 (php):

```php
// ...
use Symfony\Component\Console\Attribute\Argument;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(name: 'app:greet')]
class GreetCommand
{
    public function __invoke(
        // required argument (no default value)
        #[Argument]
        string $name,

        // optional argument (has default value)
        #[Argument]
        string $lastName = '',
    ): int {
        // ...
    }
}
```

Example 2 (php):

```php
// ...
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;

class GreetCommand extends Command
{
    // ...

    protected function configure(): void
    {
        $this
            // ...
            ->addArgument('name', InputArgument::REQUIRED, 'Who do you want to greet?')
            ->addArgument('last_name', InputArgument::OPTIONAL, 'Your last name?')
        ;
    }
}
```

Example 3 (php):

```php
// ...
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GreetCommand extends Command
{
    // ...

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $text = 'Hi '.$input->getArgument('name');

        $lastName = $input->getArgument('last_name');
        if ($lastName) {
            $text .= ' '.$lastName;
        }

        $output->writeln($text.'!');

        return Command::SUCCESS;
    }
}
```

Example 4 (unknown):

```unknown
$ php bin/console app:greet Fabien
Hi Fabien!

$ php bin/console app:greet Fabien Potencier
Hi Fabien Potencier!
```

---

## Progress Bar

**URL:** https://symfony.com/doc/7.4/components/console/helpers/progressbar.html

**Contents:**

- Progress Bar
- Customizing the Progress Bar
  - Built-in Formats
  - Custom Formats
  - Bar Settings
  - Custom Placeholders
  - Custom Messages
- Displaying Multiple Progress Bars

When executing longer-running commands, it may be helpful to show progress information, which updates as your command runs:

As an alternative, consider using the SymfonyStyle to display a progress bar.

To display progress details, use the ProgressBar, pass it a total number of units, and advance the progress as the command executes:

You can also regress the progress bar (i.e. step backwards) by calling $progress->advance() with a negative value. For example, if you call $progress->advance(-2) then it will regress the progress bar 2 steps.

By default, the progress bar helper uses the error output (stderr) as its default output. This behavior can be changed by passing an instance of StreamOutput to the ProgressBar constructor.

Instead of advancing the bar by a number of steps (with the advance() method), you can also set the current progress by calling the setProgress() method.

If you are resuming long-standing tasks, it's useful to start drawing the progress bar at a certain point. Use the second optional argument of start() to set that starting point:

If your platform doesn't support ANSI codes, updates to the progress bar are added as new lines. To prevent the output from being flooded, use the minSecondsBetweenRedraws() method to limit the number of redraws and the setRedrawFrequency() method to redraw every N iterations. By default, redraw frequency is 100ms or 10% of your max.

If you don't know the exact number of steps in advance, set it to a reasonable value and then call the setMaxSteps() method to update it as needed:

Another solution is to omit the steps argument when creating the ProgressBar instance:

The progress will then be displayed as a throbber:

An alternative to this is to use a Progress Indicator instead of a progress bar.

Whenever your task is finished, don't forget to call finish() to ensure that the progress bar display is refreshed with a 100% completion.

If you want to output something while the progress bar is running, call clear() first. After you're done, call display() to show the progress bar again.

If the progress information is stored in an iterable variable (such as an array or a PHP generator) you can use the iterate() method, which starts, advances and finishes the progress bar automatically:

The previous code will output:

By default, the information rendered on a progress bar depends on the current level of verbosity of the OutputInterface instance:

If you call a command with the quiet flag (-q), the progress bar won't be displayed.

Instead of relying on the verbosity mode of the current command, you can also force a format via setFormat():

The built-in formats are the following:

If you don't set the number of steps for your progress bar, use the \_nomax variants:

Instead of using the built-in formats, you can also set your own:

This sets the format to only display the progress bar itself:

A progress bar format is a string that contains specific placeholders (a name enclosed with the % character); the placeholders are replaced based on the current progress of the bar. Here is a list of the built-in placeholders:

The time fields elapsed, remaining and estimated are displayed with a precision of 2. That means 172799 seconds are displayed as 1 day, 23 hrs instead of 1 day, 23 hrs, 59 mins, 59 secs.

For instance, here is how you could set the format to be the same as the debug one:

Notice the :6s part added to some placeholders? That's how you can tweak the appearance of the bar (formatting and alignment). The part after the colon (:) is used to set the sprintf format of the string.

Instead of setting the format for a given instance of a progress bar, you can also define global formats:

This code defines a new minimal format that you can then use for your progress bars:

It is almost always better to redefine built-in formats instead of creating new ones as that allows the display to automatically vary based on the verbosity flag of the command.

When defining a new style that contains placeholders that are only available when the maximum number of steps is known, you should create a \_nomax variant:

When displaying the progress bar, the format will automatically be set to minimal_nomax if the bar does not have a maximum number of steps like in the example above.

A format can contain any valid ANSI codes and can also use the Symfony-specific way to set colors:

A format can span more than one line; that's very useful when you want to display more contextual information alongside the progress bar (see the example at the beginning of this article).

Among the placeholders, bar is a bit special as all the characters used to display it can be customized:

For performance reasons, Symfony redraws the screen once every 100ms. If this is too fast or too slow for your application, use the methods minSecondsBetweenRedraws() and maxSecondsBetweenRedraws():

If you want to display some information that depends on the progress bar display that are not available in the list of built-in placeholders, you can create your own. Let's see how you can create a remaining_steps placeholder that displays the number of remaining steps:

It is also possible to set a placeholder formatter per ProgressBar instance with the setPlaceholderFormatter method:

Progress bars define a placeholder called message to display arbitrary messages. However, none of the built-in formats include that placeholder, so before displaying these messages, you must define your own custom format:

Now, use the setMessage() method to set the value of the %message% placeholder before displaying the progress bar:

Messages can be combined with custom placeholders too. In this example, the progress bar uses the %message% and %filename% placeholders:

The setMessage() method accepts a second optional argument to set the value of the custom placeholders:

When using Console output sections it's possible to display multiple progress bars at the same time and change their progress independently:

After a couple of iterations, the output in the terminal will look like this:

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

The life jacket for your team and your project

**Examples:**

Example 1 (php):

```php
use Symfony\Component\Console\Helper\ProgressBar;

// creates a new progress bar (50 units)
$progressBar = new ProgressBar($output, 50);

// starts and displays the progress bar
$progressBar->start();

$i = 0;
while ($i++ < 50) {
    // ... do some work

    // advances the progress bar 1 unit
    $progressBar->advance();

    // you can also advance the progress bar by more than 1 unit
    // $progressBar->advance(3);
}

// ensures that the progress bar is at 100%
$progressBar->finish();
```

Example 2 (php):

```php
use Symfony\Component\Console\Helper\ProgressBar;

// creates a new progress bar (100 units)
$progressBar = new ProgressBar($output, 100);

// displays the progress bar starting at 25 completed units
$progressBar->start(null, 25);
```

Example 3 (php):

```php
// start with a 50 units progressbar
$progressBar = new ProgressBar($output, 50);

// a complex task has just been created: increase the progressbar to 200 units
$progressBar->setMaxSteps(200);
```

Example 4 (php):

```php
$progressBar = new ProgressBar($output);
```

---

## Table Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/table.html

**Contents:**

- Table Helper
- Adding Table Separators
- Adding Table Titles
- Setting the Column Widths Explicitly
- Rendering Vertical Tables
- Customizing the Table Style
  - Built-in Table Styles
  - Making a Custom Table Style
- Spanning Multiple Columns and Rows
- Modifying Rendered Tables

When building console applications, Symfony provides several utilities for rendering tabular data. The simplest option is to use the table methods from Symfony Style. While convenient, this approach doesn't allow customization of the table's design. For more control and advanced features, use the Table console helper explained in this article.

To display a table, use Table, set the headers, set the rows and then render the table:

You can add a table separator anywhere in the output by passing an instance of TableSeparator as a row:

You can optionally display titles at the top and the bottom of the table:

By default, the width of the columns is calculated automatically based on their contents. Use the setColumnWidths() method to set the column widths explicitly:

In this example, the first column width will be 10, the last column width will be 30 and the second column width will be calculated automatically because of the 0 value.

You can also set the width individually for each column with the setColumnWidth() method. Its first argument is the column index (starting from 0) and the second argument is the column width:

Note that the defined column widths are always considered as the minimum column widths. If the contents don't fit, the given column width is increased up to the longest content length. That's why in the previous example the first column has a 13 character length although the user defined 10 as its width.

If you prefer to wrap long contents in multiple rows, use the setColumnMaxWidth() method:

By default, table contents are displayed horizontally. You can change this behavior via the setVertical() method:

The table style can be changed to any built-in styles via setStyle():

The markdown style was introduced in Symfony 7.3.

If the built-in styles do not fit your needs, define your own:

Here is a full list of things you can customize:

You can also register a style globally:

This method can also be used to override a built-in style.

In addition to the built-in table styles, you can also apply different styles to each table cell via TableCellStyle:

To make a table cell that spans multiple columns you can use a TableCell:

You can create a multiple-line page title using a header cell that spans the entire table width:

In a similar way you can span multiple rows:

You can use the colspan and rowspan options at the same time, which allows you to create any table layout you may wish.

The render() method requires passing the entire table contents. However, sometimes that information is not available beforehand because it's generated dynamically. In those cases, use the appendRow() method, which takes the same arguments as the addRow() method, to add rows at the bottom of an already rendered table.

The only requirement to append rows is that the table must be rendered inside a Console output section:

You can create multiple lines using the addRows() method:

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

Save your teams and projects before they sink

**Examples:**

Example 1 (php):

```php
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Output\OutputInterface;
// ...

#[AsCommand(name: 'app:my-command')]
class MyCommand
{
    public function __invoke(OutputInterface $output): int
    {
        $table = new Table($output);
        $table
            ->setHeaders(['ISBN', 'Title', 'Author'])
            ->setRows([
                ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
                ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens'],
                ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
                ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
            ])
        ;
        $table->render();

        return Command::SUCCESS;
    }
}
```

Example 2 (rust):

```rust
+---------------+--------------------------+------------------+
| ISBN          | Title                    | Author           |
+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 | A Tale of Two Cities     | Charles Dickens  |
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+---------------+--------------------------+------------------+
```

Example 3 (php):

```php
use Symfony\Component\Console\Helper\TableSeparator;

$table->setRows([
    ['99921-58-10-7', 'Divine Comedy', 'Dante Alighieri'],
    ['9971-5-0210-0', 'A Tale of Two Cities', 'Charles Dickens'],
    new TableSeparator(),
    ['960-425-059-0', 'The Lord of the Rings', 'J. R. R. Tolkien'],
    ['80-902734-1-6', 'And Then There Were None', 'Agatha Christie'],
]);
```

Example 4 (rust):

```rust
+---------------+--------------------------+------------------+
| ISBN          | Title                    | Author           |
+---------------+--------------------------+------------------+
| 99921-58-10-7 | Divine Comedy            | Dante Alighieri  |
| 9971-5-0210-0 | A Tale of Two Cities     | Charles Dickens  |
+---------------+--------------------------+------------------+
| 960-425-059-0 | The Lord of the Rings    | J. R. R. Tolkien |
| 80-902734-1-6 | And Then There Were None | Agatha Christie  |
+---------------+--------------------------+------------------+
```

---

## Building a single Command Application

**URL:** https://symfony.com/doc/7.4/components/console/single_command_tool.html

**Contents:**

- Building a single Command Application

When building a command line tool, you may not need to provide several commands. In such a case, having to pass the command name each time is tedious. Fortunately, it is possible to remove this need by declaring a single command application:

You can still register a command as usual:

The setDefaultCommand() method accepts a boolean as second parameter. If true, the command echo will then always be used, without having to pass its name.

Online exam, become Symfony certified today

Save your teams and projects before they sink

**Examples:**

Example 1 (php):

```php
#!/usr/bin/env php
<?php
require __DIR__.'/vendor/autoload.php';

use Symfony\Component\Console\Attribute\Argument;
use Symfony\Component\Console\Attribute\Option;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\SingleCommandApplication;

(new SingleCommandApplication())
    ->setName('My Super Command') // Optional
    ->setVersion('1.0.0') // Optional
    ->setCode(function (OutputInterface $output, #[Argument] string $foo = 'The directory', #[Option] string $bar = ''): int {
        // output arguments and options

        return 0;
    })
    ->run();
```

Example 2 (php):

```php
#!/usr/bin/env php
<?php
require __DIR__.'/vendor/autoload.php';

use Acme\Command\DefaultCommand;
use Symfony\Component\Console\Application;

$application = new Application('echo', '1.0.0');
$command = new DefaultCommand();

$application->addCommand($command);

$application->setDefaultCommand($command->getName(), true);
$application->run();
```

---

## How to Call Other Commands

**URL:** https://symfony.com/doc/7.4/console/calling_commands.html

**Contents:**

- How to Call Other Commands

If a command depends on another one being run before it you can call that in the console command itself. This can be useful if you want to create a "meta" command that runs a bunch of other commands (for instance, all commands that need to be run when the project's code has changed on the production servers: clearing the cache, generating Doctrine proxies, dumping web assets, ...).

Use the doRun(). Then, create a new ArrayInput with the arguments and options you want to pass to the command. The command name must be the first argument.

Eventually, calling the doRun() method actually runs the command and returns the returned code from the command (return value from command \_\_invoke() method):

If you want to suppress the output of the executed command, pass a NullOutput as the second argument to $application->doRun().

Using doRun() instead of run() prevents autoexiting and allows you to return the exit code instead.

Also, using $application->doRun() instead of $application->find('demo:greet')->run() will allow proper events to be dispatched for that inner command as well.

Note that all the commands will run in the same process and some of Symfony's built-in commands may not work well this way. For instance, the cache:clear and cache:warmup commands change some class definitions, so running something after them is likely to break.

Most of the time, calling a command from code that is not executed on the command line is not a good idea. The main reason is that the command's output is optimized for the console and not to be passed to other commands.

Online exam, become Sylius certified today

Save your teams and projects before they sink

**Examples:**

Example 1 (php):

```php
// ...
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:create-user')]
class CreateUserCommand
{
    public function __invoke(OutputInterface $output, Application $application): int
    {
        $greetInput = new ArrayInput([
            // the command name is passed as first argument
            'command' => 'demo:greet',
            'name'    => 'Fabien',
            '--yell'  => true,
        ]);

        // disable interactive behavior for the greet command
        $greetInput->setInteractive(false);

        $returnCode = $application->doRun($greetInput, $output);

        // ...
    }
}
```

---

## How to Call a Command from a Controller

**URL:** https://symfony.com/doc/7.4/console/command_in_controller.html

**Contents:**

- How to Call a Command from a Controller
- Showing Colorized Command Output

The Console component documentation covers how to create a console command. This article covers how to use a console command directly from your controller.

You may have the need to call some function that is only available in a console command. Usually, you should refactor the command and move some logic into a service that can be reused in the controller. However, when the command is part of a third-party library, you don't want to modify or duplicate their code. Instead, you can run the command directly from the controller.

In comparison with a direct call from the console, calling a command from a controller has a slight performance impact because of the request stack overhead.

Imagine you want to run the debug:twig from inside your controller:

By telling the BufferedOutput it is decorated via the second parameter, it will return the Ansi color-coded content. The SensioLabs AnsiToHtml converter can be used to convert this to colorful HTML.

First, require the package:

Now, use it in your controller:

The AnsiToHtmlConverter can also be registered as a Twig Extension, and supports optional themes.

Take the exam at home

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):

```php
// src/Controller/DebugTwigController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelInterface;

class DebugTwigController extends AbstractController
{
    public function debugTwig(KernelInterface $kernel): Response
    {
        $application = new Application($kernel);
        $application->setAutoExit(false);

        $input = new ArrayInput([
            'command' => 'debug:twig',
            // (optional) define the value of command arguments
            'fooArgument' => 'barValue',
            // (optional) pass options to the command
            '--bar' => 'fooValue',
            // (optional) pass options without value
            '--baz' => true,
        ]);

        // You can use NullOutput() if you don't need the output
        $output = new BufferedOutput();
        $application->run($input, $output);

        // return the output, don't use if you used NullOutput()
        $content = $output->fetch();

        // return new Response(""), if you used NullOutput()
        return new Response($content);
    }
}
```

Example 2 (unknown):

```unknown
$ composer require sensiolabs/ansi-to-html
```

Example 3 (php):

```php
// src/Controller/DebugTwigController.php
namespace App\Controller;

use SensioLabs\AnsiConverter\AnsiToHtmlConverter;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpFoundation\Response;
// ...

class DebugTwigController extends AbstractController
{
    public function sendSpool(int $messages = 10): Response
    {
        // ...
        $output = new BufferedOutput(
            OutputInterface::VERBOSITY_NORMAL,
            true // true for decorated
        );
        // ...

        // return the output
        $converter = new AnsiToHtmlConverter();
        $content = $output->fetch();

        return new Response($converter->convert($content));
    }
}
```

---

## How to Define Commands as Services

**URL:** https://symfony.com/doc/7.4/console/commands_as_services.html

**Contents:**

- How to Define Commands as Services
- Lazy Loading

If you're using the default services.yaml configuration, your command classes are already registered as services. Great! This is the recommended setup.

You can also manually register your command as a service by configuring the service and tagging it with console.command.

For example, suppose you want to log something from within your command:

If you're using the default services.yaml configuration, the command class will automatically be registered as a service and passed the $logger argument (thanks to autowiring). In other words, you only need to create this class and everything works automatically! You can call the app:sunshine command and start logging.

You do have access to services in configure(). However, if your command is not lazy, try to avoid doing any work (e.g. making database queries), as that code will be run, even if you're using the console to execute a different command.

To make your command lazily loaded, either define its name using the PHP AsCommand attribute:

Or set the command attribute on the console.command tag in your service definition:

If the command defines aliases (using the getAliases() method) you must add one console.command tag per alias.

That's it. One way or another, the SunshineCommand will be instantiated only when the app:sunshine command is actually called.

You don't need to call setName() for configuring the command when it is lazy.

Calling the list command will instantiate all commands, including lazy commands. However, if the command is a Symfony\Component\Console\Command\LazyCommand, then the underlying command factory will not be executed.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Put the code quality back at the heart of your project

**Examples:**

Example 1 (php):

```php
namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(name: 'app:sunshine', description: 'Good morning!')]
class SunshineCommand
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke(): int
    {
        $this->logger->info('Waking up the sun');
        // ...

        return Command::SUCCESS;
    }
}
```

Example 2 (php):

```php
use Symfony\Component\Console\Attribute\AsCommand;
// ...

#[AsCommand(name: 'app:sunshine')]
class SunshineCommand
{
    // ...
}
```

Example 3 (yaml):

```yaml
# config/services.yaml
services:
  # ...

  App\Command\SunshineCommand:
    tags:
      - { name: "console.command", command: "app:sunshine" }
```

Example 4 (xml):

```xml
<!-- config/services.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <!-- ... -->

        <service id="App\Command\SunshineCommand">
            <tag name="console.command" command="app:sunshine"/>
        </service>
    </services>
</container>
```

---

## How to Hide Console Commands

**URL:** https://symfony.com/doc/7.4/console/hide_commands.html

**Contents:**

- How to Hide Console Commands

By default, all console commands are listed when executing the console application script without arguments or when using the list command.

However, sometimes commands are not intended to be run by end-users; for example, commands for the legacy parts of the application, commands exclusively run through scheduled tasks, etc.

In those cases, you can define the command as hidden by setting to true the hidden property of the AsCommand attribute:

You can also define a command as hidden using the pipe (|) syntax of command aliases. To do this, use the command name as one of the aliases and leave the main command name (the part before the |) empty:

Support for hidding commands using the pipe syntax was introduced in Symfony 7.4.

Hidden commands are still available using the JSON or XML descriptor.

Become certified from home

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):

```php
// src/Command/LegacyCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(name: 'app:legacy', hidden: true)]
class LegacyCommand
{
    // ...
}
```

Example 2 (php):

```php
// src/Command/LegacyCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;

#[AsCommand(name: '|app:legacy')]
class LegacyCommand extends Command
{
    // ...
}
```

---

## How to Make Commands Lazily Loaded

**URL:** https://symfony.com/doc/7.4/console/lazy_commands.html

**Contents:**

- How to Make Commands Lazily Loaded
- Built-in Command Loaders
  - FactoryCommandLoader
  - ContainerCommandLoader

If you are using the Symfony full-stack framework, you are probably looking for details about creating lazy commands

The traditional way of adding commands to your application is to use add(), which expects a Command instance as an argument.

This approach can have downsides as some commands might be expensive to instantiate in which case you may want to lazy-load them. Note however that lazy-loading is not absolute. Indeed a few commands such as list, help or \_complete can require instantiating other commands although they are lazy. For example list needs to get the name and description of all commands, which might require the command to be instantiated to get.

In order to lazy-load commands, you need to register an intermediate loader which will be responsible for returning Command instances:

This way, the HeavyCommand instance will be created only when the app:heavy command is actually called.

This example makes use of the built-in FactoryCommandLoader class, but the setCommandLoader() method accepts any CommandLoaderInterface instance so you can use your own implementation.

Another way to do so is to take advantage of Symfony\Component\Console\Command\LazyCommand:

The FactoryCommandLoader class provides a way of getting commands lazily loaded as it takes an array of Command factories as its only constructor argument:

Factories can be any PHP callable and will be executed each time get() is called.

The ContainerCommandLoader class can be used to load commands from a PSR-11 container. As such, its constructor takes a PSR-11 ContainerInterface implementation as its first argument and a command map as its last argument. The command map must be an array with command names as keys and service identifiers as values:

Like this, executing the app:foo command will load the FooCommand service by calling $container->get(FooCommand::class).

Check Code Performance in Dev, Test, Staging & Production

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):

```php
use App\Command\HeavyCommand;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\CommandLoader\FactoryCommandLoader;

$commandLoader = new FactoryCommandLoader([
    // Note that the `list` command will still instantiate that command
    // in this example.
    'app:heavy' => static fn(): Command => new HeavyCommand(),
]);

$application = new Application();
$application->setCommandLoader($commandLoader);
$application->run();
```

Example 2 (php):

```php
use App\Command\HeavyCommand;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\CommandLoader\FactoryCommandLoader;

// In this case although the command is instantiated, the underlying command factory
// will not be executed unless the command is actually executed or one tries to access
// its input definition to know its argument or option inputs.
$lazyCommand = new LazyCommand(
    'app:heavy',
    [],
    'This is another more complete form of lazy command.',
    false,
    static fn (): Command => new HeavyCommand(),
);

$application = new Application();
$application->add($lazyCommand);
$application->run();
```

Example 3 (php):

```php
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\CommandLoader\FactoryCommandLoader;

$commandLoader = new FactoryCommandLoader([
    'app:foo' => function (): Command { return new FooCommand(); },
    'app:bar' => [BarCommand::class, 'create'],
]);
```

Example 4 (php):

```php
use Symfony\Component\Console\CommandLoader\ContainerCommandLoader;
use Symfony\Component\DependencyInjection\ContainerBuilder;

$container = new ContainerBuilder();
$container->register(FooCommand::class, FooCommand::class);
$container->compile();

$commandLoader = new ContainerCommandLoader($container, [
    'app:foo' => FooCommand::class,
]);
```

---

## Prevent Running the Same Console Command Multiple Times

**URL:** https://symfony.com/doc/7.4/console/lockable_trait.html

**Contents:**

- Prevent Running the Same Console Command Multiple Times

You can use locks to prevent the same command from running multiple times on the same server. The Lock component provides multiple classes to create locks based on the filesystem (FlockStore), shared memory (SemaphoreStore) and even databases and Redis servers.

In addition, the Console component provides a PHP trait called LockableTrait that adds two convenient methods to lock and release commands:

The LockableTrait will use the SemaphoreStore if available and will default to FlockStore otherwise. You can override this behavior by setting a $lockFactory property with your own lock factory:

The $lockFactory property was introduced in Symfony 7.1.

Take the exam at home

Save your teams and projects before they sink

**Examples:**

Example 1 (php):

```php
// ...
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'contents:update')]
class UpdateContentsCommand
{
    use LockableTrait;

    public function __invoke(SymfonyStyle $io): int
    {
        if (!$this->lock()) {
            $io->writeln('The command is already running in another process.');

            return Command::SUCCESS;
        }

        // If you prefer to wait until the lock is released, use this:
        // $this->lock(null, true);

        // ...

        // if not released explicitly, Symfony releases the lock
        // automatically when the execution of the command ends
        $this->release();

        return Command::SUCCESS;
    }
}
```

Example 2 (php):

```php
// ...
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Lock\LockFactory;

#[AsCommand(name: 'contents:update')]
class UpdateContentsCommand
{
    use LockableTrait;

    // don't use PHP constructor property promotion here because the
    // LockableTrait already defines the `$lockFactory` property in this class
    public function __construct(LockFactory $lockFactory)
    {
        $this->lockFactory = $lockFactory;
    }

    // ...
}
```

---

## How to Style a Console Command

**URL:** https://symfony.com/doc/7.4/console/style.html

**Contents:**

- How to Style a Console Command
- Basic Usage
- Helper Methods
  - Titling Methods
  - Content Methods
  - Admonition Methods
  - Progress Bar Methods
  - User Input Methods
  - Result Methods
- Configuring the Default Styles

One of the most boring tasks when creating console commands is to deal with the styling of the command's input and output. Displaying titles and tables or asking questions to the user involves a lot of repetitive code.

Symfony provides the Symfony Style Guide, a set of helper methods to render input and output in a consistent way. If you prefer to apply your own styles at a lower level, you can use the output coloring utilities explained later in this article.

Consider for example the code used to display the title of the following command:

Displaying a simple title requires three lines of code, to change the font color, underline the contents and leave an additional blank line after the title. Dealing with styles is required for well-designed commands, but it complicates their code unnecessarily.

In order to reduce that boilerplate code, Symfony commands can optionally use the Symfony Style Guide. These styles are implemented as a set of helper methods which allow you to create semantic commands and forget about their styling.

In your \_\_invoke() method, add an argument of type SymfonyStyle. Then, you can start using any of its helpers, such as title(), which displays the title of the command:

The SymfonyStyle class defines some helper methods that cover the most common interactions performed by console commands.

It displays the given string as the command title. This method is meant to be used only once in a given command, but nothing prevents you to use it repeatedly:

It displays the given string as the title of some command section. This is only needed in complex commands which want to better separate their contents:

It displays the given string or array of strings as regular text. This is useful to render help messages and instructions for the user running the command:

It displays an unordered list of elements passed as an array:

It displays the given array of headers and rows as a compact table:

It displays the given array of headers and rows as a compact horizontal table:

It displays the given key => value pairs as a compact list of elements:

It displays the given nested array as a formatted directory/file tree structure in the console output:

The SymfonyStyle::tree() and the SymfonyStyle::createTree() methods were introduced in Symfony 7.3.

It displays a blank line in the command output. Although it may seem useful, most of the times you won't need it at all. The reason is that every helper already adds their own blank lines, so you don't have to care about the vertical spacing:

It displays the given string or array of strings as a highlighted admonition. Use this helper sparingly to avoid cluttering command's output:

Similar to the note() helper, but the contents are more prominently highlighted. The resulting contents resemble an error message, so you should avoid using this helper unless strictly necessary:

It displays a progress bar with a number of steps equal to the argument passed to the method (don't pass any value if the length of the progress bar is unknown):

It makes the progress bar advance the given number of steps (or 1 step if no argument is passed):

It finishes the progress bar (filling up all the remaining steps when its length is known):

If your progress bar loops over an iterable collection, use the progressIterate() helper:

It asks the user to provide some value:

You can pass the default value as the second argument so the user can hit the <Enter> key to select that value:

In case you need to validate the given value, pass a callback validator as the third argument:

It's very similar to the ask() method but the user's input will be hidden and it cannot define a default value. Use it when asking for sensitive information:

In case you need to validate the given value, pass a callback validator as the second argument:

It asks a Yes/No question to the user and it only returns true or false:

You can pass the default value as the second argument so the user can hit the <Enter> key to select that value:

It asks a question whose answer is constrained to the given list of valid answers:

You can pass the default value as the third argument so the user can hit the <Enter> key to select that value:

Choice questions display both the choice value and a numeric index, which starts from 0 by default. To use custom indices, pass an array with custom numeric keys as the choice values:

Finally, you can allow users to select multiple choices. To do so, users must separate each choice with a comma (e.g. typing 1, 2 will select choice 1 and 2):

If you print any URL it won't be broken/cut, it will be clickable - if the terminal provides it. If the "well formatted output" is more important, you can switch it off:

It displays the given string or array of strings highlighted as a successful message (with a green background and the [OK] label). It's meant to be used once to display the final result of executing the given command, but you can use it repeatedly during the execution of the command:

It's similar to the success() method (the given string or array of strings are displayed with a green background) but the [OK] label is not prefixed. It's meant to be used once to display the final result of executing the given command, without showing the result as a successful or failed one:

It displays the given string or array of strings highlighted as a warning message (with a red background and the [WARNING] label). It's meant to be used once to display the final result of executing the given command, but you can use it repeatedly during the execution of the command:

It displays the given string or array of strings highlighted as an error message (with a red background and the [ERROR] label). It's meant to be used once to display the final result of executing the given command, but you can use it repeatedly during the execution of the command:

By default, Symfony Styles wrap all contents to avoid having lines of text that are too long. The only exception is URLs, which are not wrapped, no matter how long they are. This is done to enable clickable URLs in terminals that support them.

If you prefer to wrap all contents, including URLs, use this method:

If you don't like the design of the commands that use the Symfony Style, you can define your own set of console styles. Create a class that implements the StyleInterface:

Then, instantiate this custom class instead of the default SymfonyStyle in your commands. Thanks to the StyleInterface you won't need to change the code of your commands to change their appearance:

If you reuse the output of a command as the input of other commands or dump it into a file for later reuse, you probably want to exclude progress bars, notes and other output that provides no real value.

Commands can output information in two different streams: stdout (standard output) is the stream where the real contents should be output and stderr (standard error) is the stream where the errors and the debugging messages should be output.

The SymfonyStyle class provides a convenient method called getErrorStyle() to switch between both streams. This method returns a new SymfonyStyle instance which makes use of the error output:

If you create a SymfonyStyle instance with an OutputInterface object that is not an instance of ConsoleOutputInterface, the getErrorStyle() method will have no effect and the returned object will still write to the standard output instead of the error output.

By default, the Windows command console doesn't support output coloring. The Console component disables output coloring for Windows systems, but if your commands invoke other scripts which emit color sequences, they will be wrongly displayed as raw escape characters. Install the Cmder, ConEmu, ANSICON, Mintty (used by default in GitBash and Cygwin) or Hyper free applications to add coloring support to your Windows command console.

Whenever you output text, you can surround the text with tags to color its output. For example:

The closing tag can be replaced by </>, which revokes all formatting options established by the last opened tag.

It is possible to define your own styles using the OutputFormatterStyle class:

Any hex color is supported for foreground and background colors. Besides that, these named colors are supported: black, red, green, yellow, blue, magenta, cyan, white, gray, bright-red, bright-green, bright-yellow, bright-blue, bright-magenta, bright-cyan and bright-white.

If the terminal doesn't support true colors, the given color is replaced by the nearest color depending on the terminal capabilities. E.g. #c0392b is degraded to #d75f5f in 256-color terminals and to red in 8-color terminals.

And available options are: bold, underscore, blink, reverse (enables the "reverse video" mode where the background and foreground colors are swapped) and conceal (sets the foreground color to transparent, making the typed text invisible - although it can be selected and copied; this option is commonly used when asking the user to type sensitive information).

You can also set these colors and options directly inside the tag name:

If you need to render a tag literally, escape it with a backslash: \<info> or use the escape() method to escape all the tags included in the given string.

Commands can use the special <href> tag to display links similar to the <a> elements of web pages:

If your terminal belongs to the list of terminal emulators that support links you can click on the "Symfony Homepage" text to open its URL in your default browser. Otherwise, you'll see "Symfony Homepage" as regular text and the URL will be lost.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

The life jacket for your team and your project

**Examples:**

Example 1 (php):

```php
// src/Command/MyCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:my-command')]
class MyCommand
{
    public function __invoke(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln([
            '<info>Lorem Ipsum Dolor Sit Amet</>',
            '<info>==========================</>',
            '',
        ]);

        // ...
    }
}
```

Example 2 (php):

```php
// src/Command/MyCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:my-command')]
class MyCommand
{
    public function __invoke(SymfonyStyle $io): int
    {
        $io->title('Lorem Ipsum Dolor Sit Amet');

        // ...
    }
}
```

Example 3 (php):

```php
$io->title('Lorem ipsum dolor sit amet');
```

Example 4 (swift):

```swift
$io->section('Adding a User');

// ...

$io->section('Generating the Password');

// ...
```

---

## Verbosity Levels

**URL:** https://symfony.com/doc/7.4/console/verbosity.html

**Contents:**

- Verbosity Levels

Console commands have different verbosity levels, which determine the messages displayed in their output. By default, commands display only the most useful messages, but you can control their verbosity with the -q and -v options:

The --silent option was introduced in Symfony 7.2.

The verbosity level can also be controlled globally for all commands with the SHELL_VERBOSITY environment variable (the -q and -v options still have more precedence over the value of SHELL_VERBOSITY):

It is possible to print a message in a command for only a specific verbosity level. For example:

The isSilent() method was introduced in Symfony 7.2.

When the silent or quiet level are used, all output is suppressed as the default write() method returns without actually printing.

When using the silent verbosity, errors won't be displayed in the console but they will still be logged through the Symfony logger integration.

The MonologBridge provides a ConsoleHandler class that allows you to display messages on the console. This is cleaner than wrapping your output calls in conditions. For an example use in the Symfony Framework, see How to Configure Monolog to Display Console Messages.

The full exception stacktrace is printed if the VERBOSITY_VERBOSE level or above is used.

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (markdown):

```markdown
# suppress all output, including errors

$ php bin/console some-command --silent

# suppress all output (even the command result messages) but display errors

$ php bin/console some-command -q
$ php bin/console some-command --quiet

# normal behavior, no option required (display only the useful messages)

$ php bin/console some-command

# increase verbosity of messages

$ php bin/console some-command -v

# display also the informative non essential messages

$ php bin/console some-command -vv

# display all messages (useful to debug errors)

$ php bin/console some-command -vvv
```

Example 2 (php):

```php
// ...
use Symfony\Component\Console\Attribute\Argument;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:create-user')]
class CreateUserCommand
{
    public function __invoke(OutputInterface $output, #[Argument] string $username, #[Argument] string $password): int
    {
        $user = new User(...);

        $output->writeln([
            'Username: '.$username,
            'Password: '.$password,
        ]);

        // available methods: ->isSilent(), ->isQuiet(), ->isVerbose(), ->isVeryVerbose(), ->isDebug()
        if ($output->isVerbose()) {
            $output->writeln('User class: '.$user::class);
        }

        // alternatively you can pass the verbosity level PHP constant to writeln()
        $output->writeln(
            'Will only be printed in verbose mode or higher',
            OutputInterface::VERBOSITY_VERBOSE
        );

        return Command::SUCCESS;
    }
}
```

---

## Question Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/questionhelper.html

**Contents:**

- Question Helper
- Asking the User for Confirmation
- Asking the User for Information
  - Let the User Choose from a List of Answers
    - Multiple Choices
  - Autocompletion
  - Do not Trim the Answer
  - Accept Multiline Answers
  - Setting a Timeout for User Input
  - Hiding the User's Response

The QuestionHelper provides functions to ask the user for more information:

The Question Helper has a single method ask() that needs an InputInterface instance as the first argument, an OutputInterface instance as the second argument and a Question as last argument.

As an alternative, consider using the SymfonyStyle to ask questions.

Suppose you want to confirm an action before actually executing it. Add the following to your command:

In this case, the user will be asked "Continue with this action?". If the user answers with y (or any word, expression starting with y due to default answer regex, e.g yeti) it returns true or false otherwise, e.g. n.

The second argument to \_\_construct() is the default value to return if the user doesn't enter any valid input. If the second argument is not provided, true is assumed.

You can customize the regex used to check if the answer means "yes" in the third argument of the constructor. For instance, to allow anything that starts with either y or j, you would set it to:

The regex defaults to /^y/i.

By default, the question helper uses the error output (stderr) as its default output. This behavior can be changed by passing an instance of StreamOutput to the ask() method.

You can also ask a question with more than a simple yes/no answer. For instance, if you want to know a bundle name, you can add this to your command:

The user will be asked "Please enter the name of the bundle". They can type some name which will be returned by the ask() method. If they leave it empty, the default value (AcmeDemoBundle here) is returned.

If you have a predefined set of answers the user can choose from, you could use a ChoiceQuestion which makes sure that the user can only enter a valid string or the index of the choice from a predefined list. In the example below, typing blue or 1 is the same choice for the user. A default value is set with 0 but red could be set instead (could be more explicit):

The option which should be selected by default is provided with the third argument of the constructor. The default is null, which means that no option is the default one.

Choice questions display both the choice value and a numeric index, which starts from 0 by default. The user can type either the numeric index or the choice value to make a selection:

To use custom indices, pass an array with custom numeric keys as the choice values:

If the user enters an invalid string, an error message is shown and the user is asked to provide the answer another time, until they enter a valid string or reach the maximum number of attempts. The default value for the maximum number of attempts is null, which means an infinite number of attempts. You can define your own error message using setErrorMessage().

Sometimes, multiple answers can be given. The ChoiceQuestion provides this feature using comma separated values. This is disabled by default, to enable this use setMultiselect():

Now, when the user enters 1,2, the result will be: You have just selected: blue, yellow. The user can also enter strings (e.g. blue,yellow) and even mix strings and the index of the choices (e.g. blue,2).

If the user does not enter anything, the result will be: You have just selected: red, blue.

You can also specify an array of potential answers for a given question. These will be autocompleted as the user types:

In more complex use cases, it may be necessary to generate suggestions on the fly, for instance if you wish to autocomplete a file path. In that case, you can provide a callback function to dynamically generate suggestions:

You can also specify if you want to not trim the answer by setting it directly with setTrimmable():

By default, the question helper stops reading user input when it receives a newline character (i.e., when the user hits ENTER once). However, you may specify that the response to a question should allow multiline answers by passing true to setMultiline():

Multiline questions stop reading user input after receiving an end-of-transmission control character (Ctrl-D on Unix systems or Ctrl-Z on Windows).

Sometimes, commands can hang if a user takes too long to respond. For example, if interactive questions are used inside an open database transaction, a delayed response could leave the transaction open for too long.

You can prevent this by setting a maximum time limit for input using the setTimeout() method. If the user doesn't respond within the specified timeout, a MissingInputException will be thrown:

The timeout only applies to interactive input streams. For non-interactive streams (such as pipes or files), the timeout is ignored and the question behaves normally.

You can also use timeouts with other question types such as ConfirmationQuestion and ChoiceQuestion:

The timeout functionality for questions was introduced in Symfony 7.4.

You can also ask a question and hide the response. This is particularly convenient for passwords:

When you ask for a hidden response, Symfony will use either a binary, change stty mode or use another trick to hide the response. If none is available, it will fallback and allow the response to be visible unless you set this behavior to false using setHiddenFallback() like in the example above. In this case, a RuntimeException would be thrown.

The stty command is used to get and set properties of the command line (such as getting the number of rows and columns or hiding the input text). On Windows systems, this stty command may generate gibberish output and mangle the input text. If that's your case, disable it with this command:

Before validating the answer, you can "normalize" it to fix minor errors or tweak it as needed. For instance, in a previous example you asked for the bundle name. In case the user adds white spaces around the name by mistake, you can trim the name before validating it. To do so, configure a normalizer using the setNormalizer() method:

The normalizer is called first and the returned value is used as the input of the validator. If the answer is invalid, don't throw exceptions in the normalizer and let the validator handle those errors.

You can even validate the answer. For instance, in a previous example you asked for the bundle name. Following the Symfony naming conventions, it should be suffixed with Bundle. You can validate that by using the setValidator() method:

The $validator is a callback which handles the validation. It should throw an exception if there is something wrong. The exception message is displayed in the console, so it is a good practice to put some useful information in it. The callback function should also return the value of the user's input if the validation was successful.

You can set the max number of times to ask with the setMaxAttempts() method. If you reach this max number it will use the default value. Using null means the number of attempts is infinite. The user will be asked as long as they provide an invalid answer and will only be able to proceed if their input is valid.

You can even use the Validator component to validate the input by using the createCallable() method:

You can also use a validator with a hidden question:

If you want to write a unit test for a command which expects some kind of input from the command line, you need to set the inputs that the command expects:

By calling setInputs(), you imitate what the console would do internally with all user input through the CLI. This method takes an array as only argument with, for each input that the command expects, a string representing what the user would have typed. This way you can test any user interaction (even complex ones) by passing the appropriate inputs.

The CommandTester automatically simulates a user hitting ENTER after each input, no need for passing an additional input.

On Windows systems Symfony uses a special binary to implement hidden questions. This means that those questions don't use the default Input console object and therefore you can't test them on Windows.

Show your Symfony expertise

Save your teams and projects before they sink

**Examples:**

Example 1 (php):

```php
$helper = new QuestionHelper();
```

Example 2 (php):

```php
// ...
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ConfirmationQuestion;

#[AsCommand(name: 'app:my-command')]
class MyCommand
{
    public function __invoke(InputInterface $input, OutputInterface $output): int
    {
        $helper = new QuestionHelper();
        $question = new ConfirmationQuestion('Continue with this action?', false);

        if (!$helper->ask($input, $output, $question)) {
            return Command::SUCCESS;
        }

        // ... do something here

        return Command::SUCCESS;
    }
}
```

Example 3 (php):

```php
$question = new ConfirmationQuestion(
    'Continue with this action?',
    false,
    '/^(y|j)/i'
);
```

Example 4 (php):

```php
use Symfony\Component\Console\Question\Question;

// ...
public function __invoke(InputInterface $input, OutputInterface $output): int
{
    // ...
    $question = new Question('Please enter the name of the bundle', 'AcmeDemoBundle');

    $bundleName = $helper->ask($input, $output, $question);

    // ... do something with the bundleName

    return Command::SUCCESS;
}
```

---

## Formatter Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/formatterhelper.html

**Contents:**

- Formatter Helper
- Print Messages in a Section
- Print Messages in a Block
- Print Truncated Messages
  - Negative String Length
  - Custom Suffix
- Formatting Time
- Formatting Memory

The FormatterHelper helper provides functions to format the output with colors. You can do more advanced things with this helper than you can with the basic colors and styles:

The methods return a string, which you'll usually render to the console by passing it to the OutputInterface::writeln method.

As an alternative, consider using the SymfonyStyle to display stylized blocks.

Symfony offers a defined style when printing a message that belongs to some "section". It prints the section in color and with brackets around it and the actual message to the right of this. Minus the color, it looks like this:

To reproduce this style, you can use the formatSection() method:

Sometimes you want to be able to print a whole block of text with a background color. Symfony uses this when printing error messages.

If you print your error message on more than one line manually, you will notice that the background is only as long as each individual line. Use the formatBlock() to generate a block output:

As you can see, passing an array of messages to the formatBlock() method creates the desired output. If you pass true as third parameter, the block will be formatted with more padding (one blank line above and below the messages and 2 spaces on the left and right).

The exact "style" you use in the block is up to you. In this case, you're using the pre-defined error style, but there are other styles (info, comment, question), or you can create your own. See How to Style a Console Command.

Sometimes you want to print a message truncated to an explicit character length. This is possible with the truncate() method.

If you would like to truncate a very long message, for example, to 7 characters, you can write:

And the output will be:

The message is truncated to the given length, then the suffix is appended to the end of that string.

If the length is negative, the number of characters to truncate is counted from the end of the string:

By default, the ... suffix is used. If you wish to use a different suffix, pass it as the third argument to the method. The suffix is always appended, unless truncated length is longer than a message and a suffix length. If you don't want to use suffix at all, pass an empty string:

Sometimes you want to format seconds to time. This is possible with the formatTime() method. The first argument is the seconds to format and the second argument is the precision (default 1) of the result:

Support for formatting up to milliseconds was introduced in Symfony 7.3.

Sometimes you want to format memory to GiB, MiB, KiB and B. This is possible with the formatMemory() method. The only argument is the memory size to format:

Show your Sylius expertise

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):

```php
$formatter = new FormatterHelper();
```

Example 2 (json):

```json
[SomeSection] Here is some message related to that section
```

Example 3 (php):

```php
$formattedLine = $formatter->formatSection(
    'SomeSection',
    'Here is some message related to that section'
);
$output->writeln($formattedLine);
```

Example 4 (php):

```php
$errorMessages = ['Error!', 'Something went wrong'];
$formattedBlock = $formatter->formatBlock($errorMessages, 'error');
$output->writeln($formattedBlock);
```

---

## Progress Indicator

**URL:** https://symfony.com/doc/7.4/components/console/helpers/progressindicator.html

**Contents:**

- Progress Indicator
- Customizing the Progress Indicator
  - Built-in Formats
  - Custom Indicator Values
  - Customize Placeholders

Progress indicators are useful to let users know that a command isn't stalled. Unlike progress bars, these indicators are used when the command duration is indeterminate (e.g. long-running commands, unquantifiable tasks, etc.)

They work by instantiating the ProgressIndicator class and advancing the progress as the command executes:

By default, the information rendered on a progress indicator depends on the current level of verbosity of the OutputInterface instance:

Call a command with the quiet flag (-q) to not display any progress indicator.

Instead of relying on the verbosity mode of the current command, you can also force a format via the second argument of the ProgressIndicator constructor:

The built-in formats are the following:

If your terminal doesn't support ANSI, use the no_ansi variants:

Instead of using the built-in indicator values, you can also set your own:

The progress indicator will now look like this:

Once the progress finishes, it displays a special finished indicator (which defaults to ✔). You can replace it with your own:

The progress indicator will now look like this:

The finishedIndicator parameter for the constructor was introduced in Symfony 7.2. The finishedIndicator parameter for method finish() was introduced in Symfony 7.2.

A progress indicator uses placeholders (a name enclosed with the % character) to determine the output format. Here is a list of the built-in placeholders:

For example, this is how you can customize the message placeholder:

Placeholders customization is applied globally, which means that any progress indicator displayed after the setPlaceholderFormatterDefinition() call will be affected.

Online exam, become Sylius certified today

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):

```php
use Symfony\Component\Console\Helper\ProgressIndicator;

// creates a new progress indicator
$progressIndicator = new ProgressIndicator($output);

// starts and displays the progress indicator with a custom message
$progressIndicator->start('Processing...');

$i = 0;
while ($i++ < 50) {
    // ... do some work

    // advances the progress indicator
    $progressIndicator->advance();
}

// ensures that the progress indicator shows a final message
$progressIndicator->finish('Finished');
```

Example 2 (markdown):

```markdown
# OutputInterface::VERBOSITY_NORMAL (CLI with no verbosity flag)

\ Processing...
| Processing...
/ Processing...

- Processing...
  ✔ Finished

# OutputInterface::VERBOSITY_VERBOSE (-v)

\ Processing... (1 sec)
| Processing... (1 sec)
/ Processing... (1 sec)

- Processing... (1 sec)
  ✔ Finished (1 sec)

# OutputInterface::VERBOSITY_VERY_VERBOSE (-vv) and OutputInterface::VERBOSITY_DEBUG (-vvv)

\ Processing... (1 sec, 6.0 MiB)
| Processing... (1 sec, 6.0 MiB)
/ Processing... (1 sec, 6.0 MiB)

- Processing... (1 sec, 6.0 MiB)
  ✔ Finished (1 sec, 6.0 MiB)
```

Example 3 (php):

```php
$progressIndicator = new ProgressIndicator($output, 'verbose');
```

Example 4 (php):

```php
$progressIndicator = new ProgressIndicator($output, 'verbose', 100, ['⠏', '⠛', '⠹', '⢸', '⣰', '⣤', '⣆', '⡇']);
```

---

## Debug Formatter Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/debug_formatter.html

**Contents:**

- Debug Formatter Helper
- Using the Debug Formatter
- Starting a Program
- Output Progress Information
- Stopping a Program
- Using multiple Programs

The DebugFormatterHelper provides functions to output debug information when running an external program, for instance a process or HTTP request. For example, if you used it to output the results of running figlet symfony, it might output something like this:

The debug formatter helper can be instantiated directly as shown:

It accepts strings and returns a formatted string, which you then output to the console (or even log the information or do anything else).

All methods of this helper have an identifier as the first argument. This is a unique value for each program. This way, the helper can debug information for multiple programs at the same time. When using the Process component, you probably want to use spl_object_hash.

This information is often too verbose to be shown by default. You can use verbosity levels to only show it when in debugging mode (-vvv).

As soon as you start a program, you can use start() to display information that the program is started:

You can tweak the prefix using the third argument:

Some programs give output while they are running. This information can be shown using progress():

In case of success, this will output:

And this in case of failure:

The third argument is a boolean which tells the function if the output is error output or not. When true, the output is considered error output.

The fourth and fifth argument allow you to override the prefix for the normal output and error output respectively.

When a program is stopped, you can use stop() to notify this to the users:

In case of failure, this will be in red and in case of success it will be green.

As said before, you can also use the helper to display more programs at the same time. Information about different programs will be shown in different colors, to make it clear which output belongs to which command.

Get your Sylius expertise recognized

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):

```php
$debugFormatter = new DebugFormatterHelper();
```

Example 2 (php):

```php
// ...
$process = new Process(...);

$output->writeln($debugFormatter->start(
    spl_object_hash($process),
    'Some process description'
));

$process->run();
```

Example 3 (unknown):

```unknown
RUN Some process description
```

Example 4 (php):

```php
$output->writeln($debugFormatter->start(
    spl_object_hash($process),
    'Some process description',
    'STARTED'
));
// will output:
//  STARTED Some process description
```

---

## Process Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/processhelper.html

**Contents:**

- Process Helper
- Arguments
- Customized Display

The Process Helper shows processes as they're running and reports useful information about process status.

To display process details, use the ProcessHelper and run your command with verbosity. For example, running the following code with a very verbose verbosity (e.g. -vv):

will result in this output:

It will result in more detailed output with debug verbosity (e.g. -vvv):

In case the process fails, debugging is easier:

By default, the process helper uses the error output (stderr) as its default output. This behavior can be changed by passing an instance of StreamOutput to the run() method.

There are two ways to use the process helper:

An array of arguments:

When running the helper against an array of arguments, be aware that these will be automatically escaped.

Passing a Process instance:

You can display a customized error message using the third argument of the run() method:

A custom process callback can be passed as the fourth argument. Refer to the Process Component for callback documentation:

Code consumes server resources. Blackfire tells you how

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):

```php
use Symfony\Component\Process\Process;

$helper = new ProcessHelper();
$process = new Process(['figlet', 'Symfony']);

$helper->run($output, $process);
```

Example 2 (php):

```php
// ...
$helper->run($output, ['figlet', 'Symfony']);
```

Example 3 (php):

```php
use Symfony\Component\Process\Process;

// ...
$process = new Process(['figlet', 'Symfony']);

$helper->run($output, $process);
```

Example 4 (php):

```php
$helper->run($output, $process, 'The process failed :(');
```

---

## Cursor Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/cursor.html

**Contents:**

- Cursor Helper
- Using the cursor
  - Moving the cursor
  - Clearing output

The Cursor allows you to change the cursor position in a console command. This allows you to write on any position of the output:

Support for injecting the Cursor helper into the \_\_invoke() method was introduced in Symfony 7.4.

There are few methods to control moving the command cursor:

You can get the current command's cursor position by using:

The cursor can also clear some output on the screen:

You also can leverage the show() and hide() methods on the cursor.

Symfony Code Performance Profiling

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):

```php
// src/Command/MyCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Cursor;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:my-command')]
class MyCommand
{
    // ...

    public function __invoke(Cursor $cursor, OutputInterface $output): int
    {
        // ...

        // moves the cursor to a specific column (1st argument) and
        // row (2nd argument) position
        $cursor->moveToPosition(7, 11);

        // and write text on this position using the output
        $output->write('My text');

        // ...
    }
}
```

Example 2 (sql):

```sql
// moves the cursor 1 line up from its current position
$cursor->moveUp();

// moves the cursor 3 lines up from its current position
$cursor->moveUp(3);

// same for down
$cursor->moveDown();

// moves the cursor 1 column right from its current position
$cursor->moveRight();

// moves the cursor 3 columns right from its current position
$cursor->moveRight(3);

// same for left
$cursor->moveLeft();

// move the cursor to a specific (column, row) position from the
// top-left position of the terminal
$cursor->moveToPosition(7, 11);
```

Example 3 (php):

```php
$position = $cursor->getCurrentPosition();
// $position[0] // columns (aka x coordinate)
// $position[1] // rows (aka y coordinate)
```

Example 4 (sql):

```sql
// clears all the output from the current line
$cursor->clearLine();

// clears all the output from the current line after the current position
$cursor->clearLineAfter();

// clears all the output from the cursors' current position to the end of the screen
$cursor->clearOutput();

// clears the entire screen
$cursor->clearScreen();
```

---

## Tree Helper

**URL:** https://symfony.com/doc/7.4/components/console/helpers/tree.html

**Contents:**

- Tree Helper
- Rendering a Tree
  - Rendering a Tree from an Array
  - Building a Tree Programmatically
- Customizing the Tree Style
  - Built-in Tree Styles
  - Making a Custom Tree Style

The Tree Helper allows you to build and display tree structures in the console. It's commonly used to render directory hierarchies, but you can also use it to render any tree-like content, such us organizational charts, product category trees, taxonomies, etc.

The TreeHelper class was introduced in Symfony 7.3.

The createTree() method creates a tree structure from an array and returns a Tree object that can be rendered in the console.

You can build a tree from an array by passing the array to the createTree() method inside your console command:

This exampe would output the following:

The given contents can be defined in a multi-dimensional array:

The above code will output the following tree:

If you don't know the tree elements beforehand, you can build the tree programmatically by creating a new instance of the Tree class and adding nodes to it:

This example outputs:

If you prefer, you can build the array of elements programmatically and then create and render the tree like this:

You can also build part of the tree from an array and then add other nodes:

The tree helper provides a few built-in styles that you can use to customize the output of the tree.

You can create your own tree style by passing the characters to the constructor of the TreeStyle class:

The above code will output the following tree:

Become certified from home

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):

```php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Helper\TreeHelper;
use Symfony\Component\Console\Helper\TreeNode;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:my-command', description: '...')]
class MyCommand
{
    // ...

    public function __invoke(SymfonyStyle $io): int
    {
        $node = TreeNode::fromValues([
            'config/',
            'public/',
            'src/',
            'templates/',
            'tests/',
        ]);

        $tree = TreeHelper::createTree($io, $node);
        $tree->render();

        // ...
    }
}
```

Example 2 (unknown):

```unknown
├── config/
├── public/
├── src/
├── templates/
└── tests/
```

Example 3 (php):

```php
$tree = TreeHelper::createTree($io, null, [
    'src' =>  [
        'Command',
        'Controller' => [
            'DefaultController.php',
        ],
        'Kernel.php',
    ],
    'templates' => [
        'base.html.twig',
    ],
]);

$tree->render();
```

Example 4 (unknown):

```unknown
├── src
│   ├── Command
│   ├── Controller
│   │   └── DefaultController.php
│   └── Kernel.php
└── templates
    └── base.html.twig
```

---

## How to Sequentially Apply Validation Groups

**URL:** https://symfony.com/doc/7.4/validation/sequence_provider.html

**Contents:**

- How to Sequentially Apply Validation Groups
- Group Sequence Providers
- Advanced Validation Group Provider
- How to Sequentially Apply Constraints on a Single Property

In some cases, you want to validate your groups by steps. To do this, you can use the GroupSequence feature. In this case, an object defines a group sequence, which determines the order groups should be validated.

For example, suppose you have a User class and want to validate that the username and the password are different only if all other validation passes (in order to avoid multiple error messages).

In this example, it will first validate all constraints in the group User (which is the same as the Default group). Only if all constraints in that group are valid, the second group, Strict, will be validated.

As you have already seen in How to Apply only a Subset of all Your Validation Constraints (Validation Groups), the Default group and the group containing the class name (e.g. User) were identical. However, when using Group Sequences, they are no longer identical. The Default group will now reference the group sequence, instead of all constraints that do not belong to any group.

This means that you have to use the {ClassName} (e.g. User) group when specifying a group sequence. When using Default, you get an infinite recursion (as the Default group references the group sequence, which will contain the Default group which references the same group sequence, ...).

Calling validate() with a group in the sequence (Strict in previous example) will cause a validation only with that group and not with all the groups in the sequence. This is because sequence is now referred to Default group validation.

You can also define a group sequence in the validation_groups form option:

Imagine a User entity which can be a normal user or a premium user. When it's a premium user, some extra constraints should be added to the user entity (e.g. the credit card details). To dynamically determine which groups should be activated, you can create a Group Sequence Provider. First, create the entity and a new constraint group called Premium:

Now, change the User class to implement GroupSequenceProviderInterface and add the getGroupSequence(), method, which should return an array of groups to use:

At last, you have to notify the Validator component that your User class provides a sequence of groups to be validated:

In the previous section, you learned how to change the sequence of groups dynamically based on the state of your entity. However, in more advanced cases you might need to use some external configuration or service to define that sequence of groups.

Managing the entity initialization and manually setting its dependencies can be cumbersome, and the implementation might not align with the entity responsibilities. To solve this, you can configure the implementation of the GroupProviderInterface outside of the entity, and even register the group provider as a service.

Here's how you can achieve this:

With this approach, you can maintain a clean separation between the entity structure and the group sequence logic, allowing for more advanced use cases.

Sometimes, you may want to apply constraints sequentially on a single property. The Sequentially constraint can solve this for you in a more straightforward way than using a GroupSequence.

Symfony Code Performance Profiling

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):

```php
// src/Entity/User.php
namespace App\Entity;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[Assert\GroupSequence(['User', 'Strict'])]
class User implements UserInterface
{
    #[Assert\NotBlank]
    private string $username;

    #[Assert\NotBlank]
    private string $password;

    #[Assert\IsTrue(
        message: 'The password cannot match your username',
        groups: ['Strict'],
    )]
    public function isPasswordSafe(): bool
    {
        return ($this->username !== $this->password);
    }
}
```

Example 2 (markdown):

```markdown
# config/validator/validation.yaml

App\Entity\User:
group_sequence: - User - Strict
getters:
passwordSafe: - 'IsTrue':
message: 'The password cannot match your username'
groups: [Strict]
properties:
username: - NotBlank: ~
password: - NotBlank: ~
```

Example 3 (xml):

```xml
<!-- config/validator/validation.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<constraint-mapping xmlns="http://symfony.com/schema/dic/constraint-mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/constraint-mapping https://symfony.com/schema/dic/constraint-mapping/constraint-mapping-1.0.xsd">

    <class name="App\Entity\User">
        <property name="username">
            <constraint name="NotBlank"/>
        </property>

        <property name="password">
            <constraint name="NotBlank"/>
        </property>

        <getter property="passwordSafe">
            <constraint name="IsTrue">
                <option name="message">The password cannot match your username</option>
                <option name="groups">
                    <value>Strict</value>
                </option>
            </constraint>
        </getter>

        <group-sequence>
            <value>User</value>
            <value>Strict</value>
        </group-sequence>
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
    public static function loadValidatorMetadata(ClassMetadata $metadata): void
    {
        $metadata->addPropertyConstraint('username', new Assert\NotBlank());
        $metadata->addPropertyConstraint('password', new Assert\NotBlank());

        $metadata->addGetterConstraint('passwordSafe', new Assert\IsTrue(
            message: 'The password cannot match your first name',
            groups: ['Strict'],
        ));

        $metadata->setGroupSequence(['User', 'Strict']);
    }
}
```

---

## How to Create a Custom Validation Constraint

**URL:** https://symfony.com/doc/7.4/validation/custom_constraint.html

**Contents:**

- How to Create a Custom Validation Constraint
- Creating the Constraint Class
  - Constraint with Private Properties
- Creating the Validator itself
- Using the new Validator
  - Constraint Validators with Dependencies
  - Constraint Validators with Custom Options
  - Create a Reusable Set of Constraints
  - Class Constraint Validator
- Testing Custom Constraints

You can create a custom constraint by extending the base constraint class, Constraint. As an example you're going to create a basic validator that checks if a string contains only alphanumeric characters.

First you need to create a Constraint class and extend Constraint:

Add #[\Attribute] to the constraint class if you want to use it as an attribute in other classes.

You can use #[HasNamedArguments] to make some constraint options required:

Constraints are cached for performance reasons. To achieve this, the base Constraint class uses PHP's get_object_vars function, which excludes private properties of child classes.

If your constraint defines private properties, you must explicitly include them in the \_\_sleep() method to ensure they are serialized correctly:

As you can see, a constraint class is fairly minimal. The actual validation is performed by another "constraint validator" class. The constraint validator class is specified by the constraint's validatedBy() method, which has this default logic:

In other words, if you create a custom Constraint (e.g. MyConstraint), Symfony will automatically look for another class, MyConstraintValidator when actually performing the validation.

The validator class only has one required method validate():

Inside validate(), you don't need to return a value. Instead, you add violations to the validator's context property and a value will be considered valid if it causes no violations. The buildViolation() method takes the error message as its argument and returns an instance of ConstraintViolationBuilderInterface. The addViolation() method call finally adds the violation to the context.

Validation error messages are automatically translated to the current application locale. If your application doesn't use translations, you can disable this behavior by calling the disableTranslation() method of ConstraintViolationBuilderInterface. See also the framework.validation.disable_translation option.

You can use custom validators like the ones provided by Symfony itself:

If your constraint contains options, then they must be public properties on the custom Constraint class you created earlier. These options can be configured like options on core Symfony constraints.

If you're using the default services.yaml configuration, then your validator is already registered as a service and tagged with the necessary validator.constraint_validator. This means you can inject services or configuration like any other service.

If you want to add some configuration options to your custom constraint, first define those options as public properties on the constraint class:

Then, inside the validator class you can access these options directly via the constraint class passed to the validate() method:

When using this constraint in your own application, you can pass the value of the custom options like you pass any other option in built-in constraints:

In case you need to consistently apply a common set of constraints across your application, you can extend the Compound constraint.

Besides validating a single property, a constraint can have an entire class as its scope.

For instance, imagine you also have a PaymentReceipt entity and you need to make sure the email of the receipt payload matches the user's email. First, create a constraint and override the getTargets() method:

Now, the constraint validator will get an object as the first argument to validate():

The atPath() method defines the property with which the validation error is associated. Use any valid PropertyAccess syntax to define that property.

A class constraint validator must be applied to the class itself:

Use the ConstraintValidatorTestCase class to simplify writing unit tests for your custom constraints:

Consider the following compound constraint that checks if a string meets the minimum requirements for your password policy:

You can use the CompoundConstraintTestCase class to check precisely which of the constraints failed to pass:

The CompoundConstraintTestCase class was introduced in Symfony 7.2.

Take the exam at home

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (php):

```php
// src/Validator/ContainsAlphanumeric.php
namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute]
class ContainsAlphanumeric extends Constraint
{
    public string $message = 'The string "{{ string }}" contains an illegal character: it can only contain letters or numbers.';
    public string $mode = 'strict';

    // all configurable options must be passed to the constructor
    public function __construct(?string $mode = null, ?string $message = null, ?array $groups = null, $payload = null)
    {
        $this->mode = $mode ?? $this->mode;
        $this->message = $message ?? $this->message;

        parent::__construct(null, $groups, $payload);
    }
}
```

Example 2 (php):

```php
// src/Validator/ContainsAlphanumeric.php
namespace App\Validator;

use Symfony\Component\Validator\Attribute\HasNamedArguments;
use Symfony\Component\Validator\Constraint;

#[\Attribute]
class ContainsAlphanumeric extends Constraint
{
    public string $message = 'The string "{{ string }}" contains an illegal character: it can only contain letters or numbers.';

    #[HasNamedArguments]
    public function __construct(
        public string $mode,
        ?array $groups = null,
        mixed $payload = null,
    ) {
        parent::__construct(null, $groups, $payload);
    }
}
```

Example 3 (php):

```php
// src/Validator/ContainsAlphanumeric.php
namespace App\Validator;

use Symfony\Component\Validator\Attribute\HasNamedArguments;
use Symfony\Component\Validator\Constraint;

#[\Attribute]
class ContainsAlphanumeric extends Constraint
{
    public string $message = 'The string "{{ string }}" contains an illegal character: it can only contain letters or numbers.';

    #[HasNamedArguments]
    public function __construct(
        private string $mode,
        ?array $groups = null,
        mixed $payload = null,
    ) {
        parent::__construct(null, $groups, $payload);
    }

    public function __sleep(): array
    {
        return array_merge(
            parent::__sleep(),
            [
                'mode'
            ]
        );
    }
}
```

Example 4 (php):

```php
// in the base Symfony\Component\Validator\Constraint class
public function validatedBy(): string
{
    return static::class.'Validator';
}
```

---

## How to Apply only a Subset of all Your Validation Constraints (Validation Groups)

**URL:** https://symfony.com/doc/7.4/validation/groups.html

**Contents:**

- How to Apply only a Subset of all Your Validation Constraints (Validation Groups)

By default, when validating an object all constraints of this class will be checked whether or not they actually pass. In some cases, however, you will need to validate an object against only some constraints on that class. To do this, you can organize each constraint into one or more "validation groups" and then apply validation against one group of constraints.

For example, suppose you have a User class, which is used both when a user registers and when a user updates their contact information later:

With this configuration, there are three validation groups:

Constraints in the Default group of a class are the constraints that have either no explicit group configured or that are configured to a group equal to the class name or the string Default.

When validating just the User object, there is no difference between the Default group and the User group. But, there is a difference if User has embedded objects. For example, imagine User has an address property that contains some Address object and that you've added the Valid constraint to this property so that it's validated when you validate the User object.

If you validate User using the Default group, then any constraints on the Address class that are in the Default group will be used. But, if you validate User using the User validation group, then only constraints on the Address class with the User group will be validated.

In other words, the Default group and the class name group (e.g. User) are identical, except when the class is embedded in another object that's actually the one being validated.

If you have inheritance (e.g. User extends BaseUser) and you validate with the class name of the subclass (i.e. User), then all constraints in the User and BaseUser will be validated. However, if you validate using the base class (i.e. BaseUser), then only the default constraints in the BaseUser class will be validated.

To tell the validator to use a specific group, pass one or more group names as the third argument to the validate() method:

If no groups are specified, all constraints that belong to the group Default will be applied.

In a full stack Symfony project, you'll usually work with validation indirectly through the form library. For information on how to use validation groups inside forms, see Configuring Validation Groups in Forms.

Code consumes server resources. Blackfire tells you how

Get your Sylius expertise recognized

**Examples:**

Example 1 (php):

```php
// src/Entity/User.php
namespace App\Entity;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

class User implements UserInterface
{
    #[Assert\Email(groups: ['registration'])]
    private string $email;

    #[Assert\NotBlank(groups: ['registration'])]
    #[Assert\Length(min: 7, groups: ['registration'])]
    private string $password;

    #[Assert\Length(min: 2)]
    private string $city;
}
```

Example 2 (markdown):

```markdown
# config/validator/validation.yaml

App\Entity\User:
properties:
email: - Email: { groups: [registration] }
password: - NotBlank: { groups: [registration] } - Length: { min: 7, groups: [registration] }
city: - Length:
min: 2
```

Example 3 (xml):

```xml
<!-- config/validator/validation.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<constraint-mapping xmlns="http://symfony.com/schema/dic/constraint-mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://symfony.com/schema/dic/constraint-mapping
        https://symfony.com/schema/dic/constraint-mapping/constraint-mapping-1.0.xsd
    ">

    <class name="App\Entity\User">
        <property name="email">
            <constraint name="Email">
                <option name="groups">
                    <value>registration</value>
                </option>
            </constraint>
        </property>

        <property name="password">
            <constraint name="NotBlank">
                <option name="groups">
                    <value>registration</value>
                </option>
            </constraint>
            <constraint name="Length">
                <option name="min">7</option>
                <option name="groups">
                    <value>registration</value>
                </option>
            </constraint>
        </property>

        <property name="city">
            <constraint name="Length">
                <option name="min">2</option>
            </constraint>
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
    public static function loadValidatorMetadata(ClassMetadata $metadata): void
    {
        $metadata->addPropertyConstraint('email', new Assert\Email(
            groups: ['registration'],
        ));

        $metadata->addPropertyConstraint('password', new Assert\NotBlank(
            groups: ['registration'],
        ));
        $metadata->addPropertyConstraint('password', new Assert\Length(
            min: 7,
            groups: ['registration'],
        ));

        $metadata->addPropertyConstraint('city', new Assert\Length(
            min: 2,
        ));
    }
}
```

---

## How to Handle Different Error Levels

**URL:** https://symfony.com/doc/7.4/validation/severity.html

**Contents:**

- How to Handle Different Error Levels
- 1. Assigning the Error Level
- 2. Customize the Error Message Template

Sometimes, you may want to display constraint validation error messages differently based on some rules. For example, you have a registration form for new users where they enter some personal information and choose their authentication credentials. They would have to choose a username and a secure password, but providing bank account information would be optional. However, you want to make sure that these optional fields, if entered, are still valid, but display their errors differently.

The process to achieve this behavior consists of two steps:

Use the payload option to configure the error level for each constraint:

When validation of the User object fails, you can retrieve the constraint that caused a particular failure using the getConstraint() method. Each constraint exposes the attached payload as a public property:

For example, you can leverage this to customize the form_errors block so that the severity is added as an additional HTML class:

For more information on customizing form rendering, see How to Customize Form Rendering.

Show your Sylius expertise

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (php):

```php
// src/Entity/User.php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class User
{
    #[Assert\NotBlank(payload: ['severity' => 'error'])]
    protected string $username;

    #[Assert\NotBlank(payload: ['severity' => 'error'])]
    protected string $password;

    #[Assert\Iban(payload: ['severity' => 'warning'])]
    protected string $bankAccountNumber;
}
```

Example 2 (markdown):

```markdown
# config/validator/validation.yaml

App\Entity\User:
properties:
username: - NotBlank:
payload:
severity: error
password: - NotBlank:
payload:
severity: error
bankAccountNumber: - Iban:
payload:
severity: warning
```

Example 3 (xml):

```xml
<!-- config/validator/validation.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<constraint-mapping xmlns="http://symfony.com/schema/dic/constraint-mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/constraint-mapping https://symfony.com/schema/dic/constraint-mapping/constraint-mapping-1.0.xsd">

    <class name="App\Entity\User">
        <property name="username">
            <constraint name="NotBlank">
                <option name="payload">
                    <value key="severity">error</value>
                </option>
            </constraint>
        </property>
        <property name="password">
            <constraint name="NotBlank">
                <option name="payload">
                    <value key="severity">error</value>
                </option>
            </constraint>
        </property>
        <property name="bankAccountNumber">
            <constraint name="Iban">
                <option name="payload">
                    <value key="severity">warning</value>
                </option>
            </constraint>
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
    // ...

    public static function loadValidatorMetadata(ClassMetadata $metadata): void
    {
        $metadata->addPropertyConstraint('username', new Assert\NotBlank(
            payload: ['severity' => 'error'],
        ));
        $metadata->addPropertyConstraint('password', new Assert\NotBlank(
            payload: ['severity' => 'error'],
        ));
        $metadata->addPropertyConstraint('bankAccountNumber', new Assert\Iban(
            payload: ['severity' => 'warning'],
        ));
    }
}
```

---

## How to Translate Validation Constraint Messages

**URL:** https://symfony.com/doc/7.4/validation/translations.html

**Contents:**

- How to Translate Validation Constraint Messages
- Custom Translation Domain

The validation constraints used in forms can translate their error messages by creating a translation resource for the validators translation domain.

First of all, install the Symfony translation component (if it's not already installed in your application) running the following command:

Suppose you've created a plain-old-PHP object that you need to use somewhere in your application:

Add constraints through any of the supported methods. Set the message option to the translation source text. For example, to guarantee that the $name property is not empty, add the following:

Now, create a validators catalog file in the translations/ directory:

You may need to clear your cache (even in the dev environment) after creating this file for the first time.

Symfony will also create translation files for the built-in validation messages. You can optionally set the enabled_locales option to restrict the available locales in your application. This will improve performance a bit because Symfony will only generate the translation files for those locales instead of all of them.

You can also use TranslatableMessage to build your violation message:

You can learn more about translatable messages in the dedicated section.

The default translation domain can be changed globally using the FrameworkBundle configuration:

Or it can be customized for a specific violation from a constraint validator:

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

The life jacket for your team and your project

**Examples:**

Example 1 (unknown):

```unknown
$ composer require symfony/translation
```

Example 2 (php):

```php
// src/Entity/Author.php
namespace App\Entity;

class Author
{
    public string $name;
}
```

Example 3 (php):

```php
// src/Entity/Author.php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class Author
{
    #[Assert\NotBlank(message: 'author.name.not_blank')]
    public string $name;
}
```

Example 4 (markdown):

```markdown
# config/validator/validation.yaml

App\Entity\Author:
properties:
name: - NotBlank: { message: 'author.name.not_blank' }
```

---

## Changing the Default Command

**URL:** https://symfony.com/doc/7.4/components/console/changing_default_command.html

**Contents:**

- Changing the Default Command
- Learn More!

The Console component will always run the ListCommand when no command name is passed. In order to change the default command you need to pass the command name to the setDefaultCommand() method:

Executing the application and changing the default command:

Test the new default console command by running the following:

This will print the following to the command line:

This feature has a limitation: you cannot pass any argument or option to the default command because they are ignored.

Measure & Improve Symfony Code Performance

Online Symfony certification, take it now!

**Examples:**

Example 1 (php):

```php
namespace Acme\Console\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'hello:world', description: 'Outputs "Hello World"')]
class HelloWorldCommand extends Command
{
    public function __invoke(SymfonyStyle $io): int
    {
        $io->writeln('Hello World');

        return Command::SUCCESS;
    }
}
```

Example 2 (php):

```php
// application.php
use Acme\Console\Command\HelloWorldCommand;
use Symfony\Component\Console\Application;

$command = new HelloWorldCommand();
$application = new Application();
$application->add($command);
$application->setDefaultCommand($command->getName());
$application->run();
```

Example 3 (unknown):

```unknown
$ php application.php
```

Example 4 (unknown):

```unknown
Hello World
```

---

## Understanding how Console Arguments and Options Are Handled

**URL:** https://symfony.com/doc/7.4/components/console/console_arguments.html

**Contents:**

- Understanding how Console Arguments and Options Are Handled
- Option Attribute Constraints

Symfony Console applications follow the same docopt standard used in most CLI utility tools. This article explains how to handle edge-cases when the commands define options with required values, without values, etc. Read this other article to learn about using arguments and options inside Symfony Console commands.

Have a look at the following command that has three options:

This example uses invokable commands with the #[Option] attribute. If you prefer the classic approach:

Since the foo option doesn't accept a value, it will be either false (when it is not passed to the command) or true (when --foo was passed by the user). The value of the bar option (and its b shortcut respectively) is required. It can be separated from the option name either by spaces or = characters. The cat option (and its c shortcut) behaves similar except that it doesn't require a value. Have a look at the following table to get an overview of the possible ways to pass options:

Things get a little bit more tricky when the command also accepts an optional argument:

You might have to use the special -- separator to separate options from arguments. Have a look at the fifth example in the following table where it is used to tell the command that World is the value for arg and not the value of the optional cat option:

When using the #[Option] attribute in invokable commands, the following rules are enforced to ensure consistent behavior:

Examples of valid option definitions:

Examples of invalid option definitions:

Code consumes server resources. Blackfire tells you how

Online exam, become Symfony certified today

**Examples:**

Example 1 (php):

```php
namespace Acme\Console\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Attribute\Option;

#[AsCommand(name: 'demo:args', description: 'Describe args behaviors')]
class DemoArgsCommand
{
    public function __invoke(
        #[Option(shortcut: 'f')] bool $foo = false,
        #[Option(shortcut: 'b')] string $bar = '',
        #[Option(shortcut: 'c')] string|bool $cat = false,
    ): int {
        // ...
    }
}
```

Example 2 (php):

```php
namespace Acme\Console\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputDefinition;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'demo:args', description: 'Describe args behaviors')]
class DemoArgsCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->setDefinition(
                new InputDefinition([
                    new InputOption('foo', 'f'),
                    new InputOption('bar', 'b', InputOption::VALUE_REQUIRED),
                    new InputOption('cat', 'c', InputOption::VALUE_OPTIONAL),
                ])
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // ...
    }
}
```

Example 3 (julia):

```julia
// ...

new InputDefinition([
    // ...
    new InputArgument('arg', InputArgument::OPTIONAL),
]);
```

Example 4 (php):

```php
#[Option] bool $verbose = false           // VALUE_NONE
#[Option] bool $colors = true             // VALUE_NEGATABLE (--colors or --no-colors)
#[Option] ?bool $debug = null             // VALUE_NEGATABLE (--debug or --no-debug)
#[Option] string $format = 'json'         // VALUE_REQUIRED
#[Option] ?string $filter = null          // VALUE_REQUIRED (optional value)
#[Option] int $limit = 10                 // VALUE_REQUIRED
#[Option] array $roles = []               // VALUE_IS_ARRAY
#[Option] string|bool $output = false     // VALUE_OPTIONAL (--output or --output=file.txt)
```

---

## The Console Helpers

**URL:** https://symfony.com/doc/7.4/components/console/helpers/index.html

**Contents:**

- The Console Helpers

The Console component comes with some useful helpers. These helpers contain functions to ease some common tasks.

Check Code Performance in Dev, Test, Staging & Production

Save your teams and projects before they sink

---

## Using Console Commands, Shortcuts and Built-in Commands

**URL:** https://symfony.com/doc/7.4/components/console/usage.html

**Contents:**

- Using Console Commands, Shortcuts and Built-in Commands
- Built-in Commands
- Global Options
- Shortcut Syntax

In addition to the options you specify for your commands, there are some built-in options as well as a couple of built-in commands for the Console component.

These examples assume you have added a file application.php to run at the CLI:

There is a built-in command list which outputs all the standard options and the registered commands:

You can get the same output by not running any command as well

The help command lists the help information for the specified command. For example, to get the help for the list command:

Running help without specifying a command will list the global options:

You can get help information for any command with the --help option. To get help for the list command:

You can suppress output with:

The --silent option was introduced in Symfony 7.2.

You can get more verbose messages (if this is supported for a command) with:

To output even more verbose messages you can use these options:

If you set the optional arguments to give your application a name and version:

to get this information output:

If you do not provide a console name then it will just output:

You can force turning on ANSI output coloring with:

You can suppress any interactive questions from the command you are running with:

You do not have to type out the full command names. You can just type the shortest unambiguous name to run a command. So if there are non-clashing commands, then you can run help like this:

If you have commands using : to namespace commands then you only need to type the shortest unambiguous text for each part. If you have created the demo:greet as shown in The Console Component then you can run it with:

If you enter a short command that's ambiguous (i.e. there are more than one command that match), then no command will be run and some suggestions of the possible commands to choose from will be output.

Symfony Code Performance Profiling

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (php):

```php
#!/usr/bin/env php
<?php
// application.php

require __DIR__.'/vendor/autoload.php';

use Symfony\Component\Console\Application;

$application = new Application();
// ...
$application->run();
```

Example 2 (unknown):

```unknown
$ php application.php list
```

Example 3 (unknown):

```unknown
$ php application.php
```

Example 4 (unknown):

```unknown
$ php application.php help list
```

---
