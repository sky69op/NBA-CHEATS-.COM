<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>XML Sitemap</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            margin: 1.5rem;
            color: #111;
            background: #fff;
            line-height: 1.4;
          }
          h1 {
            font-size: 1.25rem;
            margin: 0 0 0.5rem;
          }
          p {
            margin: 0 0 1rem;
            color: #444;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          th,
          td {
            border: 1px solid #ccc;
            padding: 0.35rem 0.5rem;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f3f4f6;
          }
          a {
            color: #0b57d0;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>
          <xsl:value-of select="count(s:urlset/s:url)" />
          URLs (for crawlers; this page is a human-readable view).
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
              <th>Change frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td>
                  <a href="{s:loc}">
                    <xsl:value-of select="s:loc" />
                  </a>
                </td>
                <td>
                  <xsl:value-of select="s:lastmod" />
                </td>
                <td>
                  <xsl:value-of select="s:changefreq" />
                </td>
                <td>
                  <xsl:value-of select="s:priority" />
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
