flowchart LR
    A[Client Viewer] --> B[GET /studies API]

    B --> C[Authorization Check]
    B --> D[Postgres: DicomStudy]

    B --> E[Submit Tasks to ThreadPoolExecutor]

    subgraph Parallel Execution
        E --> F[fetch_study(study_uid)]

        F --> G[Cache Lookup]

        G -->|Hit| H[Return Cached Study Result]

        G -->|Miss| I[d_query_study]

        I --> J[QIDO: /rs/studies]
        J --> K[d_query_series_for_study]

        K --> L[QIDO: /rs/studies/{uid}/series]

        L --> M[d_find Tag Extraction]
        I --> M

        M --> N[d_datetime_to_iso]

        N --> O[Build Study Object]

        O --> P[Cache Store]

        P --> Q[Return Study Result]
    end

    %% as_completed handling
    E --> R[as_completed(futures)]

    subgraph as_completed Loop
        R --> S[Wait for any future to finish]
        S --> T[Yield finished future]
        T --> U[future.result()]
        U --> V[Append to results list]
        V --> S
    end

    V --> W[Final Aggregated Results]

    W --> A
