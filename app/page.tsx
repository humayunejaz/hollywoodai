"use client";
import { useAuthModal } from "../components/AuthModalProvider";
export default function Home() {
  const { openAuth } = useAuthModal();
  return (
    <main>
      <nav className="landing-nav">
        <a href="/">
          <img
            src="/assets/logo-dark.png"
            alt="HollywoodAI"
            className="nav__logo"
          />
        </a>

        <div className="nav__links">
          <a href="#summary" className="nav__link">
            About
          </a>
          <a href="#features" className="nav__link">
            Features
          </a>
          <a href="#steps" className="nav__link">
            How it works
          </a>
          <a href="#" className="nav__link">
            Privacy policy
          </a>
        </div>

        <button
  type="button"
  className="nav__button"
  onClick={() => openAuth("login")}
>
  Sign In
</button>
      </nav>

      
{/* Hero Section */}
<header className="landing-hero">
  <div className="row header__row">
    <div className="header__widget">
      <span className="header__widget__title">
        Meet HollywoodAI
      </span>

      <span className="header__widget__emoji">
        ✨
      </span>

      <span className="header__widget__description">
        Unleash the Power of AI
      </span>
    </div>

    <h1 className="header__title">
      Ultimate AI <br />
      Summariser
      <img
        src="/assets/bolt.svg"
        alt=""
        className="header__title__icon"
      />
    </h1>

    <p className="header__paragraph">
      All-in-one platform to watch your favourite
      movies in minutes using AI.
    </p>

    <a href="#steps" className="header__button">
      <div className="header__button__iconWrapper">
        <i className="fa-solid fa-play header__button__icon" />
      </div>

      <span className="header__button__text">
        See how it works
      </span>
    </a>
  </div>

  <svg
    className="header__svg"
    width="1440"
    height="105"
    viewBox="0 0 1440 105"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M0 0C240 68.7147 480 103.072 720 103.072C960 103.072 1200 68.7147 1440 0V104.113H0V0Z"
    />
  </svg>
</header>

{/* Features Section */}
<section id="features">
  <div className="container">
    <div className="row features__row">

      <h1 className="features__title">
        The future of AI.
      </h1>

      <div className="features__para">
        HollywoodAI is designed to help you enjoy
        high-quality summaries instantly, without
        breaking a sweat.
      </div>

      <div className="features__list">

        {/* Feature 1 */}
        <div className="feature">
          <div className="feature__iconWrapper">
            <i className="feature__icon fa-solid fa-pen"></i>
          </div>
          <div className="feature__text">
            <h4 className="feature__text__title">
              AI Generated Summaries
            </h4>
            <p className="feature__text__para">
              Save time with summaries of the
              world's best movies.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature">
          <div className="feature__iconWrapper">
            <i className="feature__icon fa-regular fa-circle-play"></i>
          </div>
          <div className="feature__text">
            <h4 className="feature__text__title">
              Read or Listen
            </h4>
            <p className="feature__text__para">
              Switch between reading and listening
              modes seamlessly.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature">
          <div className="feature__iconWrapper">
            <i className="feature__icon fa-solid fa-bars-staggered"></i>
          </div>
          <div className="feature__text">
            <h4 className="feature__text__title">
              Find Your Next Flick
            </h4>
            <p className="feature__text__para">
              Explore our movie lists and
              personalized recommendations.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="feature">
          <div className="feature__iconWrapper">
            <i className="feature__icon fa-solid fa-mobile"></i>
          </div>
          <div className="feature__text">
            <h4 className="feature__text__title">
              Multi Platform Access
            </h4>
            <p className="feature__text__para">
              Enjoy your favourite movies on any device.
            </p>
          </div>
        </div>

        {/* Feature 5 */}
        <div className="feature">
          <div className="feature__iconWrapper">
            <i className="feature__icon fa-solid fa-shield"></i>
          </div>
          <div className="feature__text">
            <h4 className="feature__text__title">
              Payment Gateways
            </h4>
            <p className="feature__text__para">
              We securely process all card payments.
            </p>
          </div>
        </div>

        {/* Feature 6 */}
        <div className="feature">
          <div className="feature__iconWrapper">
            <i className="feature__icon fa-solid fa-hands-holding-circle"></i>
          </div>
          <div className="feature__text">
            <h4 className="feature__text__title">
              Eco-Friendly Option
            </h4>
            <p className="feature__text__para">
              HollywoodAI donates 10% of profits
              to charities.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

{/* Summary Section */}
<section id="summary">
  <div className="container">
    <div className="row summary__row">

      {/* Left Side: Text */}
      <div className="summary__text">

        <div className="summary__widget">
          <span className="summary__widget__title">
            The future of entertainment
          </span>

          <span className="summary__widget__emoji">
            ⏺
          </span>

          <span className="summary__widget__description">
            AI
          </span>
        </div>

        <h2 className="summary__title">
          Say goodbye to 2 hour movies.
        </h2>

        <p className="summary__para">
          HollywoodAI is designed to help you get
          high-quality summaries of your favourite
          movies instantly, without breaking a sweat.
          With our intuitive interface and powerful
          features, you can easily digest any movie
          in just minutes instead of hours.
        </p>

      </div>

      {/* Right Side: Illustration */}
      <figure className="summary__figure">
        <img
          src="/assets/summary.png"
          alt="HollywoodAI movie summary illustration"
          className="summary__figure__img"
        />

        <span className="summary__figure__caption1">
          Search. Summarise. Repeat.
        </span>

        <span className="summary__figure__caption2">
          Powered by AI
        </span>
      </figure>

    </div>
  </div>
</section>

{/* How It Works Section */}
<section id="steps">
  <div className="container">
    <div className="row steps__row">

      <h2 className="steps__title">
        So, how does it work?
      </h2>

      <div className="steps__list">
        <div className="step-divider"></div>

        {/* Step 1 */}
        <div className="step">
          <div className="step__number">
            <span>1</span>
          </div>

          <div className="step__para">
            Browse through our wide selection of
            the world&apos;s most popular movies
          </div>
        </div>

        {/* Step 2 */}
        <div className="step">
          <div className="step__number">
            <span>2</span>
          </div>

          <div className="step__para">
            Simply select a movie you&apos;d like
            to have summarised and let our AI
            algorithms do the rest.
          </div>
        </div>

        {/* Step 3 */}
        <div className="step">
          <div className="step__number">
            <span>3</span>
          </div>

          <div className="step__para">
            Take a couple of minutes to read and
            listen to the summary. And you’re done!
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

{/* Testimonials Section */}
<section id="testimonials">
  <div className="container">
    <div className="row testimonials__row">

      <div className="testimonials__widget">
        <span className="testimonials__widget__title">
          Testimonials
        </span>

        <span className="testimonials__widget__emoji">
          ⏺
        </span>

        <span className="testimonials__widget__description">
          TrustPilot
        </span>
      </div>

      <h2 className="testimonials__title">
        What our members say.
      </h2>

      <div className="testimonials__list">

        {/* Testimonial 1 */}
        <div className="testimonial">
          <img
            src="/assets/testimonial-1.png"
            alt="Olivia Chapman"
            className="testimonial__img"
          />

          <span className="testimonial__name">
            Olivia Chapman
          </span>

          <span className="testimonial__occupation">
            Student
          </span>

          <p className="testimonial__para">
            &quot;Hollywood AI made big promises and
            delivered on them! Absolutely cannot
            live without this tool!&quot;
          </p>
        </div>

        {/* Testimonial 2 */}
        <div className="testimonial">
          <img
            src="/assets/testimonial-2.png"
            alt="Eric Fisherman"
            className="testimonial__img"
          />

          <span className="testimonial__name">
            Eric Fisherman
          </span>

          <span className="testimonial__occupation">
            Professor
          </span>

          <p className="testimonial__para">
            &quot;Definitely worth the purchase if
            you are a busy person who stills
            want to keep up with the latest
            movies&quot;
          </p>
        </div>

        {/* Testimonial 3 */}
        <div className="testimonial">
          <img
            src="/assets/testimonial-3.png"
            alt="Anisong Silkum"
            className="testimonial__img"
          />

          <span className="testimonial__name">
            Anisong Silkum
          </span>

          <span className="testimonial__occupation">
            Student
          </span>

          <p className="testimonial__para">
            &quot;The summaries provide a really
            great overview of the movies.
            It&apos;s also very easy to use.
            5/5!&quot;
          </p>
        </div>

      </div>
    </div>
  </div>
</section>

{/* Footer */}
<footer>
  {/* Call to Action */}
  <section id="cta">
    <svg
      className="cta__svg"
      preserveAspectRatio="none"
      width="1440"
      height="86"
      viewBox="0 0 1440 86"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 85.662C240 29.1253 480 0.857 720 0.857C960 0.857 1200 29.1253 1440 85.662V0H0V85.662Z" />
    </svg>

    <div className="container">
      <div className="row cta__row">
        <p className="cta__widget">
          <span className="cta__widget__logo">
            HollywoodAI
          </span>
          Endless benefits, one subscription.
        </p>

        <h2 className="cta__title">
          Start your free trial.
        </h2>

        <p className="cta__para">
          Enjoy your favourite movies in minutes by
          letting AI do the work for you.
        </p>

        <button
  type="button"
  className="cta__button"
  onClick={() => openAuth("register")}
>
  <span className="cta__button__text">
    Join HollywoodAI
  </span>
  <img
    src="/assets/bolt.svg"
    alt=""
    className="cta__button__icon"
  />
</button>
      </div>
    </div>
  </section>

  {/* Social Media Links */}
  <section id="links">
    <div className="links__container">
      <img
        src="/assets/logo-light.png"
        alt="HollywoodAI"
        className="links__logo"
      />

      <div className="links__list">
        <a className="links__link" href="#">
          <i className="fa-brands fa-instagram links__link__icon" />
          <span className="links__link__text">
            Instagram
          </span>
        </a>

        <a className="links__link" href="#">
          <i className="fa-brands fa-twitter links__link__icon" />
          <span className="links__link__text">
            Twitter
          </span>
        </a>

        <a className="links__link" href="#">
          <i className="fa-brands fa-facebook links__link__icon" />
          <span className="links__link__text">
            Facebook
          </span>
        </a>

        <a className="links__link" href="#">
          <i className="fa-brands fa-tiktok links__link__icon" />
          <span className="links__link__text">
            Tiktok
          </span>
        </a>
      </div>
    </div>
  </section>

  {/* Email Subscription and Copyright */}
  <section id="copyright">
    <div className="copyright__container">
      <form
        className="copyright__form"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          className="copyright__form__input"
          placeholder="Enter your email"
          aria-label="Email address"
        />

        <button
          type="button"
          className="copyright__form__button"
        >
          Subscribe
        </button>
      </form>

      <span className="copyright__text">
        2024 Copyright © Hollywood AI
      </span>
    </div>
  </section>
</footer>





    </main>
  );
}
