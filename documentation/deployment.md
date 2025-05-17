# Deployment

Change are deployed to production by running:

```bash
kamal deploy
```

## Installing Kamal

If you haven't done this before you can install Kamal like this:

```bash
brew install ruby
```

Add the following to your `.zshrc` or `.bashrc`:

```bash
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export PATH="$(ruby -e 'print Gem.user_dir')/bin:$PATH"
```

Install the gems:

```bash
gem install kamal
```
