PNPM ?= pnpm
UVX ?= uvx
PHOENIX_ENV_ARGS = $(foreach env_file,$(wildcard ../../.env .env),--env-file $(env_file))
export PHOENIX_WORKING_DIR ?= $(CURDIR)/.phoenix
export PHOENIX_HOST ?= 127.0.0.1

.PHONY: help install run check phoenix

help:
	@echo "install  Install agent dependencies"
	@echo "phoenix  Start local Phoenix at http://localhost:6006"
	@echo "run      Run one traced leetspeak conversion (optional TEXT='...')"
	@echo "check    Type-check the agent"

install:
	$(PNPM) install --frozen-lockfile

phoenix:
	$(UVX) $(PHOENIX_ENV_ARGS) --from arize-phoenix phoenix serve

run:
	$(PNPM) start $(if $(TEXT),"$(TEXT)")

check:
	$(PNPM) run typecheck
