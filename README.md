GmusicRemote
============

<strong>NodeJS Application to control Gmusicbrowser via Mobile Phones, Tablets and any other external device.</strong>

<ul>
<li>Get Gmusicbrowser here: <a href="http://gmusicbrowser.org/" target="_blank">http://gmusicbrowser.org/</a></li>
<li>Download and install nodejs: <a href="http://nodejs.org/" target="_blank">http://nodejs.org/</a></li>
</ul>

<strong>WARNING:</strong> Currently in production. Basic functionality already working. No official release available.

##Installation (basic)

You can download the whole Project as a ZIP file on the right sidebar.

##Installation (keep it up to date)

To be able to update GmusicRemote and keep it up to date, you should follow these steps:

1. Clone the repository:

  ```sh
  git clone https://github.com/gruberpatrick/gmusicremote.git
	cd gmusicremote
  ```

2. Get the latest release (Update):

  ```sh
  git fetch
	git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
  ```

3. Run GmusicRemote:

  ```sh
  node bin/www
  ```

4. The App should start at Port 3000. Open the Browser and call your Servers IP-Address on Port 3000. Something like this:

	```sh
	192.168.1.5:3000
	```

#####- Thanks to the Atom Team to provide such a great way to keep Software up to date -
