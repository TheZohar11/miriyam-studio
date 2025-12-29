Project: Miriyam Web

- Multi-stage production `Dockerfile` with HEALTHCHECK and non-root runtime
- GitHub Actions workflow at `.github/workflows/ci.yml` to build and push image to GHCR
- Kubernetes manifests under `k8s/` (Deployment, Service, HPA) as minimal skeleton
- `README.md` with run/cleanup commands

Quick commands

Stop all running containers

```
docker ps -q | ForEach-Object { docker stop $_ }
```

Remove all containers

```
docker ps -a -q | ForEach-Object { docker rm $_ }
```

Remove the app image

```
docker rmi miriyam-studio -f
```

Rebuild image

```
docker build -t miriyam-studio .
```

Run with docker (reads `.env` in this repo)

```
docker run -d -p 5501:5501 --env-file .env --name miriyam-studio miriyam-studio
```

Run with docker-compose

```
docker-compose up -d --build
```

Kubernetes

```
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

Notes

- DO NOT commit secret files. Use the `.env` file for local development (listed in `.gitignore`).
- To deploy to Kubernetes, create a secret locally and never commit it:

```
kubectl create secret generic app-secrets --from-literal=MONGO_URI="your-mongo-uri-here"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

- CI workflow pushes to GHCR; configure repository permissions if you want automated publishes.
