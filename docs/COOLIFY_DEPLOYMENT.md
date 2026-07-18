# Coolify deployment

This deployment runs Corteza and PostgreSQL 15 with persistent named volumes.
Neither service publishes a Docker host port, and PostgreSQL stays private to the
Compose network.

## Repository and image versions

Deploy the `main` branch from `ooeygg/corteza` after it has been created from the
verified `2024.9.x` release branch.

The deployment uses these exact production tags:

- `cortezaproject/corteza:2024.9.9-hotfix.1`
- `postgres:15.18-bookworm`

Resolved registry digests at the time this deployment was prepared:

- Corteza: `sha256:fe0dc9d21ebd2da5888d5ab26fb374a77e847610c95a5da2bfbdd31d374ae1e1`
- PostgreSQL multi-platform index: `sha256:b0c5bab0fbba8e0c221f73b1dc6359ec35f8650074377e727299df248fc8ad51`

## Coolify application settings

Configure the application as follows:

- Build Pack: **Docker Compose**
- Base Directory: `/`
- Docker Compose Location: `/docker-compose.yaml`
- Git branch: `main`

Set these Coolify environment variables:

- `CORTEZA_IMAGE=cortezaproject/corteza:2024.9.9-hotfix.1`
- `POSTGRES_IMAGE=postgres:15.18-bookworm`
- `CORTEZA_DOMAIN=corteza.vibimine.com`
- `POSTGRES_PASSWORD=<generated secret>`
- `AUTH_JWT_SECRET=<generated secret>`

Generate new production values locally and paste them into Coolify without
writing them to the repository:

```sh
openssl rand -hex 32
openssl rand -hex 64
```

Coolify should discover the `postgres` and `corteza` services. Assign a domain
only to `corteza`:

```text
http://corteza.vibimine.com:80
```

For `postgres`, leave both **Domain** and **Host port mappings** empty. Remove
the old generated hostname:

```text
rzdsuosidzrzmy67gr4aotd2.47.195.94.247.sslip.io
```

Remove any proxy route to container port 3000. Corteza listens on internal port
80. Do not add a host port mapping to either service.

## LAN-only DNS and routing

Create this record only in the DNS resolver used by LAN clients:

```text
corteza.vibimine.com  A  <COOLIFY_SERVER_PRIVATE_LAN_IP>
```

The destination must be a private address in `192.168.0.0/16`, `10.0.0.0/8`, or
`172.16.0.0/12`; do not use the server's public IP.

The intended request path is:

```text
LAN device
  -> local DNS
  -> Coolify server private IP
  -> Coolify reverse proxy
  -> Corteza container port 80
  -> PostgreSQL private Compose service
```

Do not create any of the following for Corteza:

- Cloudflare public DNS record
- Cloudflare Tunnel route
- Cloudflare Published Application
- Cloudflare Private Hostname route
- Router port forward
- `sslip.io` hostname

The existing `coolify.vibimine.com` Cloudflare route is independent and must
not be changed.

## Deployment verification

After deploying, verify in Coolify that both containers are healthy and that
the Corteza logs show successful PostgreSQL migrations. Then verify from a LAN
client:

```sh
dig +short corteza.vibimine.com
curl --fail http://corteza.vibimine.com/healthcheck
curl --fail http://corteza.vibimine.com/version
```

Confirm the DNS response is the Coolify server's private LAN address. Recreate
the Corteza container and confirm the health endpoint returns successfully and
application data remains present. Finally, test from a device outside the LAN
and confirm the hostname does not resolve and cannot be reached.

## Rollback

Before the first deployment, preserve the previous Coolify application
configuration and identify any existing volumes. Roll back the repository by
reverting the deployment commit, restore the previous Coolify configuration,
and reattach the preserved volumes. If an existing database is upgraded, take
and retain a database backup before starting the new Corteza container.
