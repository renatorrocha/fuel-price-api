# Fuel Price API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descrição

Este é um projeto de API para gerenciamento de preços de combustíveis, construído com o framework [NestJS](https://nestjs.com). A API permite o upload de arquivos CSV contendo dados de preços de combustíveis e fornece endpoints para consultar esses dados.

## Configuração do Projeto

Para configurar o projeto, siga os passos abaixo:

### Pré-requisitos

- Node.js (versão 14 ou superior)
- pnpm (gerenciador de pacotes)

### Instalação

```bash
$ pnpm install
```

## Compilar e Executar o Projeto

```bash
# Modo de desenvolvimento
$ pnpm run start

# Modo de observação
$ pnpm run start:dev

# Modo de produção
$ pnpm run start:prod
```

## Endpoints da API

### Upload de CSV

- **POST** `/fuel/upload-csv`
  - Permite o upload de um arquivo CSV contendo dados de preços de combustíveis.

### Consultar Preços

- **GET** `/fuel/prices`
  - Retorna todos os preços de combustíveis disponíveis.

### Buscar Preços

- **GET** `/fuel/search`
  - Permite buscar preços de combustíveis filtrando por região e produto.
  - Parâmetros:
    - `region`: Região do combustível.
    - `product`: Tipo de combustível.
