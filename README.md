Wenn Sie eine Verwaltung aus NRW sind, binden wir auch Ihre WMS Dienste ggf. gerne hier ein:<br>
https://kreis-viersen.github.io/quattromap/<br>
Kontaktieren Sie uns dazu gerne per E-Mail unter [open@kreis-viersen.de]( mailto:open@kreis-viersen.de?subject=QuattroMap ).

# Inhaltsverzeichnis

- [QuattroMap](#quattromap)
    - [Messwerkzeuge](#messwerkzeuge)
  - [Aktuell verfügbare Dienste](#aktuell-verfügbare-dienste)
    - [Layer](#layer)
    - [Overlays](#overlays)
  - [Permalink](#permalink)
  - [Konfiguration](#konfiguration)
  - [Testen von Pull Requests](#testen-von-pull-requests)
  - [Develop](#develop)
    - [Search](#search)

# QuattroMap

[![GitHub CI status](https://github.com/kreis-viersen/quattromap/workflows/ci/badge.svg)][github-action-ci]
[![License](https://img.shields.io/badge/license-MIT-blue.svg)][license]

[github-action-ci]: https://github.com/kreis-viersen/quattromap/actions?query=workflow%3Aci
[license]:          https://tldrlegal.com/license/mit-license

<a href="https://kreis-viersen.github.io/quattromap/"><img src="./quattromap_screenshot.png"></a>

QuattroMap ist eine vom Kreis Viersen entwickelte Kartenanwendung, die vor allem die Außendiensttätigkeiten unterstützen kann.

Unter https://kreis-viersen.github.io/quattromap/ ist eine Demo des Tools von jedem internetfähigen Gerät, wie Tablet, Smartphone, Laptop und PC, erreichbar. Die Anwendung ist kompatibel mit modernen Browsern, wie Mozilla Firefox, Google Chrome, Safari. Der Microsoft Internet Explorer wird nicht unterstützt.

## Develop

```bash
# clone the repository
git clone https://github.com/kreis-viersen/quattromap/
cd quattromap
```
Install the deps, start the dev server and open the web browser on `http://localhost:8080/`.

```bash
# install dependencies
npm install
# start dev server
npm start
```

The build process will watch for changes to the filesystem, rebuild and autoreload QuattroMap. However note this from the [webpack-dev-server docs](https://webpack.js.org/configuration/dev-server/):

> webpack uses the file system to get notified of file changes. In some cases this does not work. For example, when using Network File System (NFS). Vagrant also has a lot of problems with this. In these cases, use polling. ([snippet source](https://webpack.js.org/configuration/dev-server/#devserverwatchoptions-))

```bash
# build the app
npm run build
```
Once the build is finished, you'll find it at `dist/`.

```bash
# publish files to a gh-pages branch on GitHub
npm run deploy
```

### Search

For the search functionality https://github.com/mapbox/mapbox-gl-geocoder is used.

For your own QuattroMap please use your own access token:
https://docs.mapbox.com/help/how-mapbox-works/access-tokens/.
