# Revisão de segurança e preparação para deploy

**Data:** 25 de outubro de 2026  
**Escopo:** revisão estática do backend Spring Boot, frontend React/Vite, configuração Docker Compose, dependências e testes disponíveis. Nenhum deploy ou acesso a dados de produção foi realizado.

## Resumo executivo

Foram confirmados três achados. As correções de configuração, transação e exportação CSV foram implementadas e validadas localmente. Na continuação desta auditoria, CORS foi restrito por allowlist, JWT foi limitado ao HS256 e a inicialização valida os parâmetros, e o perfil de produção falha fechado sem origem HTTPS. A exposição anterior de credenciais não pode ser considerada encerrada até que a senha do banco e a chave JWT sejam rotacionadas no ambiente e a chave antiga deixe de ser aceita. A revisão não comprova todos os requisitos de produção; portanto, este documento não declara que o sistema está completamente seguro.

## Achados

| ID | Severidade | Evidência | Impacto | Estado |
|---|---|---|---|---|
| SEC-01 | Alta | `src/main/resources/application.properties` continha credenciais de banco e chave de assinatura JWT em configuração versionada. | Leitores do repositório poderiam usar as credenciais ou forjar tokens. A alteração da cópia atual não remove valores já presentes no histórico Git. | **Parcialmente corrigido:** a configuração agora exige variáveis de ambiente. **Pendente:** rotacionar a senha do banco e a chave JWT; invalidar tokens assinados pela chave antiga; avaliar a limpeza do histórico e comunicar clones existentes. |
| SEC-02 | Média | `RegistroService` alterava o saldo e persistia o registro em operações separadas; `SaldoService` fazia read-modify-save sem serialização por usuário. | Falhas parciais ou requisições concorrentes poderiam deixar o saldo divergente dos registros. | **Corrigido no código:** métodos de criação, edição e exclusão usam transação; bloqueio pessimista da linha do usuário serializa alterações e criação/leitura inicial de saldo. Testes de integração incluídos. |
| SEC-03 | Média | `original-project/src/services/reportsExport.ts` protegia apenas fórmulas cujo primeiro caractere fosse `=`, `+`, `-` ou `@`. | Células de nome/descrição com espaços ou controles iniciais poderiam ser interpretadas como fórmulas por alguns programas de planilha. | **Corrigido no código:** campos CSV são neutralizados quando o primeiro caractere não branco/controle é um prefixo de fórmula. Casos com espaços, controles e prefixos foram testados. |

## Alterações realizadas

- `src/main/resources/application.properties`: removidos valores literais de conexão e assinatura; configuração usa `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` e `JWT_SECRET`. `JWT_EXPIRATION_MS` é configurável e mantém um valor padrão de duração, não de segredo. O log SQL foi desativado e o log de segurança deixou de operar em `TRACE`.
- `docker-compose.yml`: injeta `JWT_SECRET` no container da API.
- `.env.example`: lista as variáveis necessárias com valores ilustrativos não funcionais. O arquivo `.env` continua ignorado pelo Git.
- `UserRepository`, `RegistroService` e `SaldoService`: bloqueiam a linha do usuário durante as operações mutáveis de registros e alterações/criação de saldo; operações financeiras são transacionais.
- `src/test/java/com/reis/financeiro/RegistroServiceTransactionTest.java`: cobre criação/edição/exclusão com saldo correspondente e duas criações concorrentes para o mesmo usuário.
- `original-project/src/services/reportsExport.ts`: neutraliza células CSV com espaços Unicode, caracteres de controle ou BOM antes de sinais `=`, `+`, `-` ou `@`.

## Áreas verificadas

- **Autenticação:** endpoints privados exigem autenticação; o fluxo é stateless com JWT no header `Authorization`. O serviço valida a assinatura e expiração do token e exige chave HMAC com pelo menos 32 bytes. A configuração de senha usa BCrypt. Não foi identificado fluxo de refresh token.
- **Autorização:** os serviços revisados de registros e cofres usam consultas limitadas ao proprietário autenticado. O perfil `/user/me` deriva a conta do principal autenticado e retorna DTO reduzido. Testes existentes cobrem autorização de registros e perfil.
- **Foto de perfil:** não foi encontrada rota de upload no servidor; a imagem atual é processada e armazenada localmente no navegador, portanto não há upload de arquivo a auditar no backend.
- **Exportação:** arquivos são gerados no frontend a partir de registros obtidos pelas rotas autenticadas. Foi verificada a proteção CSV; PDF e XLSX não apresentaram o mesmo caminho de interpretação de fórmulas no código revisado.
- **Frontend:** a revisão não encontrou `dangerouslySetInnerHTML`, `innerHTML` ou `eval` nos arquivos pesquisados. A foto permanece local; tokens ficam no armazenamento de sessão do navegador conforme o cliente atual.
- **Dependências frontend:** `npm audit --offline --omit=dev` retornou zero vulnerabilidades no cache disponível. O resultado offline não substitui uma consulta atualizada ao catálogo de advisories.

## Pendências e limitações para produção

1. **Rotacionar credenciais antes de disponibilizar o serviço.** Gerar nova senha para o banco e nova chave JWT aleatória com pelo menos 32 bytes; injetá-las pelo provedor de segredos/ambiente; invalidar tokens antigos. Não reutilizar valores que estiveram no repositório.
2. **Avaliar exposição no histórico Git.** A remoção na árvore atual não apaga commits existentes nem cópias clonadas. Fazer rotação primeiro; eventual reescrita do histórico exige coordenação com quem possui clones e não foi executada.
3. **Schema de produção:** `spring.jpa.hibernate.ddl-auto=update` continua configurado. Não há migrações versionadas identificadas. Definir migrações controladas ou validar o schema no deploy; não confiar em atualização automática de schema para uma base produtiva.
4. **CORS e HTTPS:** CORS agora usa origens explícitas, testes cobrem origem permitida/negada, preflight e `Authorization`; o perfil `prod` exige allowlist HTTPS. Ainda não há proxy, balanceador, certificado ou redirecionamento TLS neste repositório. Configurar e validar TLS na infraestrutura final antes de expor a API.
5. **Dependências backend:** OWASP Dependency-Check Maven 13.0.0 (versão estável mais recente consultada em 25/10/2026) foi executado, mas a atualização do NVD foi recusada por ausência de chave de API. Nenhum resultado de advisories deve ser inferido dessa execução. Fornecer chave NVD pela variável/secret de CI e repetir a varredura completa.
6. **Operação de produção:** backups, restauração, gestão de segredos, health checks, observabilidade sem dados financeiros e procedimento de rollback dependem do ambiente de implantação e não foram exercitados aqui.
7. **Validação PostgreSQL:** `docker info` indica que não há daemon Docker utilizável. `pg_isready` encontrou serviços locais aceitando conexões em 5432 e 5433, mas sua identidade/isolamento não foi confirmada; não foram acessados para evitar executar testes em banco possivelmente compartilhado ou de produção. Concorrência ainda não foi validada com PostgreSQL.
8. **Histórico Git:** foram examinadas 29 revisões históricas de `src/main/resources/application.properties`. Múltiplas revisões contêm valores não vazios para senha do banco e chave de assinatura JWT. Nenhum valor foi reproduzido. O arquivo `.env` local é ignorado; seu conteúdo não foi lido. Rotação externa e avaliação/limpeza coordenada do histórico permanecem necessárias.

## Testes executados

- `mvn test` — **aprovado nesta auditoria**, 24 testes, 0 falhas, 0 erros.
- `mvn -Dtest=RegistroServiceTransactionTest test` — **aprovado**, 2 testes de integração.
- `npm run build` — **aprovado** (TypeScript e build Vite).
- `npx eslint src/services/reportsExport.ts` — **aprovado**.
- Teste isolado do `criarCsv` compilado — **aprovado** para fórmula no início, com espaços iniciais, tabulação, controle inicial e texto normal.
- `npm audit --offline --omit=dev` — **0 advisories encontrados no cache local**; cobertura atual do catálogo não garantida.
- `docker compose --env-file .env.example config --quiet` — **aprovado** para sintaxe e interpolação do Compose.
- Verificação local confirmou que `application.properties` não contém valores literais para senha/chave e que `.env` permanece ignorado pelo Git.

## Atualização da auditoria — 25 de outubro de 2026

### Corrigido e verificado nesta etapa

- CORS global wildcard removido. A origem agora é obtida por `CORS_ALLOWED_ORIGINS`, métodos são limitados a GET/POST/PUT/DELETE/OPTIONS, os headers a Authorization/Content-Type/Accept e credenciais CORS ficam desabilitadas.
- O perfil padrão limita CORS ao frontend local (`http://localhost:5173`). O perfil `prod` exige a variável de origem e rejeita origens que não sejam HTTPS; valores ausentes, vazios, wildcard, com path ou URL malformada impedem a inicialização.
- `TokenService` valida na inicialização chave com no mínimo 32 bytes e expiração positiva, assina apenas HS256 e limita o parser a HS256. A troca da chave invalida tokens assinados pela anterior.
- `spring.jpa.hibernate.ddl-auto` passou para `validate` na configuração principal e no perfil de produção. O banco não é alterado automaticamente pela inicialização.
- O plugin OWASP Dependency-Check foi fixado em 13.0.0 no `pom.xml`, sem atrelar a varredura ao build regular.

### Corrigido no código, aguardando validação externa

- A origem HTTPS real precisa ser provisionada no ambiente de produção. CORS e o requisito HTTPS do perfil foram cobertos por testes locais; a infraestrutura TLS não está presente neste repositório.
- A configuração segura impede `ddl-auto=update`, mas não há migração Flyway/Liquibase. Não foi criada uma migração inferida das entidades: o schema real e constraints do banco existente não foram inspecionados. Criar baseline/migrações sem cópia autorizada e schema observado poderia quebrar ou perder dados.
- A senha do banco e chave JWT foram retiradas do arquivo atual e são obrigatórias por ambiente, mas a rotação real e invalidação de tokens antigos não foram executadas. A configuração atual força novos valores, não altera o PostgreSQL nem secret store.

### Pendente

- Rotação da senha do PostgreSQL e JWT em ambiente autorizado, confirmação de rejeição das credenciais/chaves antigas e atualização do secret manager.
- Decidir e configurar proxy/load balancer TLS, HTTPS e cabeçalhos encaminhados somente para proxies confiáveis.
- Capturar schema e dados de uma cópia isolada, criar migrações não destrutivas e testar inicialização/migração/reinicialização. A aplicação agora valida schema; sem migrações, não se declara a transição concluída.
- Repetir Dependency-Check 13.0.0 com chave NVD válida e avaliar os relatórios HTML/JSON. Execução atual falhou durante atualização da base: `Invalid API Key, length of 0 too short`; não há resultado de vulnerabilidades.
- Rodar concorrência e migrações em PostgreSQL isolado. Docker daemon indisponível; serviços em portas locais responderam a `pg_isready`, mas não foram acessados porque não foi possível confirmar que são descartáveis.

### Testes e comandos desta atualização

- `mvn -Dtest=TokenServiceTest,UserControllerSecurityTest,CorsConfigTest test` — **15 testes aprovados**, 0 falhas/erros; cobre token expirado/adulterado, algoritmo HS256, chave anterior, configuração inválida, CORS autorizado/negado e preflight.
- `mvn test` — **aprovado após esta atualização**, 24 testes, 0 falhas/erros; inclui regressões de autenticação/autorização, concorrência em H2, CORS e validação JWT.
- `mvn -DskipTests package` — **aprovado** com o plugin scanner declarado.
- `npm run build` — **aprovado** (TypeScript e build Vite).
- `npm run test:export` — **aprovado**, 1 teste persistente cobrindo prefixos `=`, `+`, `-`, `@`, espaços Unicode, tabulação, controle inicial e texto normal.
- `npx eslint src/services/reportsExport.ts src/services/reportsExport.test.mjs` — **aprovado**.
- `npm run lint` — **falhou por quatro problemas preexistentes fora do escopo desta atualização**: `ThemeContext.tsx` (Fast Refresh) e chamadas `setState` em efeitos em `CofresPage.tsx` e `Dashboard.tsx`. Nenhum deles está nos arquivos do exportador alterados nesta etapa.
- `npm audit --offline --omit=dev` — **aprovado**, zero findings no cache local; isso não prova que a base estivesse atualizada.
- `docker compose --env-file .env.example config --quiet` — **aprovado**; o exemplo usa segredos vazios intencionalmente e não é um ambiente executável até provisionar valores.
- Varredura OWASP Dependency-Check 13.0.0 — **não concluída**: ausência de NVD API key.
- PostgreSQL, HTTPS/TLS e migrações — **não testados** por ausência de ambiente confirmado como isolado e infraestrutura de destino.

### Arquivos desta atualização

- `src/main/java/com/reis/financeiro/config/CorsConfig.java`
- `src/main/java/com/reis/financeiro/service/TokenService.java`
- `src/main/resources/application.properties`
- `src/main/resources/application-prod.properties`
- `src/test/resources/application-test.properties`
- `src/test/java/com/reis/financeiro/CorsConfigTest.java`
- `src/test/java/com/reis/financeiro/UserControllerSecurityTest.java`
- `src/test/java/com/reis/financeiro/TokenServiceTest.java`
- `pom.xml`
- `.env.example`
- `docker-compose.yml`
- `original-project/package.json`
- `original-project/src/services/reportsExport.test.mjs`

### Evidências para liberação

1. Comprovante operacional, sem expor valores, de rotação do banco/JWT e invalidação da chave anterior.
2. Teste do perfil `prod` com origem HTTPS real autorizada e origem adversária recusada através do proxy/TLS final.
3. Migração testada em cópia representativa do schema atual, sem perda de dados, e validação de inicialização repetida.
4. Relatório atualizado OWASP Dependency-Check usando base NVD atual e investigação de findings relevantes.
5. Testes concorrentes e de migração aprovados em PostgreSQL descartável/staging.

## Checklist mínimo antes do deploy

- [ ] Rotacionar senha do banco e chave JWT expostas historicamente; invalidar tokens antigos.
- [ ] Provisionar os valores em um secret manager ou ambiente seguro; não versionar `.env`.
- [ ] Definir `CORS_ALLOWED_ORIGINS` HTTPS real no perfil `prod` e confirmar HTTPS/TLS no proxy.
- [ ] Criar/testar migrações com cópia representativa do schema; a aplicação agora usa `ddl-auto=validate`.
- [ ] Reexecutar OWASP Dependency-Check 13.0.0 com NVD API key e tratar findings.
- [ ] Confirmar backups e testar restauração; preparar rollback de aplicação e schema.
- [ ] Executar a suíte completa e smoke tests contra PostgreSQL de staging isolado.
- [ ] Validar login, endpoints autenticados, isolamento entre usuários, exportação e logs no staging.
- [ ] Somente então aprovar publicação; nenhuma etapa deste checklist foi executada em produção.

## Parecer técnico atual

**Não apto para deploy neste momento.** CORS foi restringido e testado no código, mas rotação efetiva de segredos, TLS final, migrações/schema representativo, scanner Maven atualizado e concorrência PostgreSQL não foram comprovados. Reavaliar somente após as evidências acima.
