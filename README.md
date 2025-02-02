# umbraperf - Profiling Tool

Tool:  https://umbraperf.github.io/umbraperf

[![Umbra-Profiler Release & Deploy Process](https://github.com/umbraperf/umbraperf/actions/workflows/main.yml/badge.svg)](https://github.com/umbraperf/umbraperf/actions/workflows/main.yml)

## Overview

### Project Directory Layout:

umbraperf/
│
├── src/                  # Frontend (React)
│   ├── components/
│   ├── controller/
│   ├── model/
│   ├── style/
│   ├── types/
│   ├── app.tsx
├── crate/                # Backend (Rust)
│   ├── exec/
└── README.md             # << You are here

## Getting started

Node version >= 18.0.0

```
npm install
```

```
npm start
```

### Migration to React v18

React Flow Version 10 needs following migration to work with React v18:
https://reactflow.dev/learn/troubleshooting/migrate-to-v10