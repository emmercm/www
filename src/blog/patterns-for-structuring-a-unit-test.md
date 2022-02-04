---

title: Patterns for Structuring a Unit Test
image: https://unsplash.com/photos/8-P12w-Ntwg
date: 2022-02-04T04:42:00
tags:
- testing

---

The goal of meaningful unit tests is to test behavior. Here are some patterns to help accomplish that.

## Given-when-then

_Given-when-then_ is a way to write acceptance criteria scenarios in business requirements that then can be translated 1:1 to unit tests. The style stems from [behavior-driven development (BDD)](https://www.agilealliance.org/glossary/bdd) which specifies that tests should be written to test _behavior_ (as opposed to _state_). These scenarios should map so well to tests that they practically write themselves.

It's possible to use _given-when-then_ test structure with acceptance criteria written in other ways, but there is a lot of benefit to be gained from tests matching acceptance criteria word for word.

Here's the three parts to each _given-when-then_ scenario (and therefore test):

- **Given** some context or state of the world
- **When** we invoke some action or behavior
- **Then** we should get some expected change

Some examples of good _given-when-then_ acceptance criteria using the [Gherkin](https://cucumber.io/docs/gherkin/reference/) syntax:

```text
Given a user that is logged out
 When the user authenticates with valid credentials
 Then the user should be logged in

Given a user that is logged out
 When the user authenticates with invalid credentials
 Then the user should be given an error
```

You can combine multiple expressions within each clause using "ands" like this:

```text
Given a user with $10 in store credit
  And the price of an orange is $2
 When that user places an order for 2 oranges
 Then an order containing 2 oranges should be created
  And that user should have $6 in their wallet
```

Let's translate these behaviors into unit tests:

```javascript
const User = (username, password) => {
	let loggedIn = false;
	return {
  	isLoggedIn: () => loggedIn,
  	login: (usernameInput, passwordInput) => {
    	if (usernameInput !== username || passwordInput !== password) {
      	throw 'invalid username or password';
      }
      loggedIn = true;
    }
  };
};

const test = (func) => func();

test(() => {
	// Given a user that is logged out
  const user = User("admin", "letmein");

  // When the user authenticates with valid credentials
  user.login("admin", "letmein");

  // Then the user should be logged in
  if (!user.isLoggedIn()) {
  	throw 'User was not logged in!';
  }
});

test(() => {
	// Given a user that is logged out
  const user = User("admin", "letmein");

  // When the user authenticates with invalid credentials
  try {
	  user.login("admin", "password123");
  } catch(err) {
    // Then the user should be given an error
    return;
  }

  throw 'An error was not returned!';
});

console.log('All tests passed!');
```

```javascript
const User = (storeCredit) => {
	return {
  	storeCredit: () => storeCredit,
  	purchase: (products) => {
	    const order = Order(products);
      storeCredit -= order.total;
      return order;
    }
  };
};

const Product = (name, price) => ({name, price});

const Order = (products) => ({
	products,
  total: products.reduce((total,product)=>total+product.price,0)
});

const test = (func) => func();

test(() => {
	// Given a user with $10 in store credit
  const user = User(10);

  // And the price of an orange is $2
  const orange = Product("Orange", 2);

  // When that user places an order for 2 oranges
  const order = user.purchase([orange, orange]);

  // Then an order containing 2 oranges should be created
  if (order.products.length !== 2 || order.total !== 4) {
  	throw 'Invalid order produced!';
  }

  // And that user should have $6 in their wallet
  if (user.storeCredit() !== 6) {
  	throw 'User has invalid store credit!';
  }
});

console.log('All tests passed!');
```

Notice how each of these scenarios only has one "when". If we limit ourselves to only one behavior under test, we're forced to have a clear purpose for the test.

The _given-when-then_ test style can be used with any testing framework, but there are some that are explicitly for BDD: [Cucumber](https://cucumber.io/), [JBehave](https://cucumber.io/), and [SpecFlow](https://specflow.org/) to name a few.

## Arrange-act-assert

_Arrange-act-assert_ is mostly synonymous with _given-when-then_, but stems from [test-driven development (TDD)](https://www.agilealliance.org/glossary/tdd/) rather than BDD.

The three parts to an _arrange-act-assert_ test are:

- **Arrange** the data and state necessary for the test
- **Act** on the object or method under test
- **Assert** the expected results

The main value loss with using _arrange-act-assert_ is it tends to describe technical behavior and test internal state while _given-when-then_ encourages testing of functional behavior. Otherwise, there isn't a significant difference other than three "A" words are harder to distinguish at a glance.

Also, I have seen a lot of _arrange-act-assert_ articles encourage mocking during "arrange" which can lead to the fallacy of testing _implementation_ rather than _behavior_. The debate of spies vs. mocks is too large to cover here.

## Setup-exercise-verify-teardown

Known as the "four-phase test", _setup-exercise-verify-teardown_ is nearly the same as _arrange-act-assert_ other than it explicitly calls out a "teardown" phase to reset the system-under-test to its pre-setup phase.

If we try our best to create a [test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) where we have noticeably more unit tests than integration tests, or if we apply the principles of [hexagonal architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) and use test doubles for our repositories, then the "teardown" step shouldn't be needed in most cases.
