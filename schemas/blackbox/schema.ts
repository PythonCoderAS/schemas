import { Type } from "@sinclair/typebox";
import { LiteralUnion } from "../../common/utils.js";

const Duration = Type.String({ pattern: "[0-9]+(ms|[smhdwy])" });

const HTTPHeaderMatchSpec = Type.Object({
  header: Type.String(),
  regexp: Type.String(),
  allow_missing: Type.Optional(Type.Boolean()),
});

const TLSVersion = LiteralUnion("TLS10", "TLS11", "TLS12", "TLS13");

const TLSConfig = Type.Object({
  insecure_skip_verify: Type.Optional(Type.Boolean()),
  ca_cert: Type.Optional(Type.String()),
  cert_file: Type.Optional(Type.String()),
  key_file: Type.Optional(Type.String()),
  server_name: Type.Optional(Type.String()),
  min_version: Type.Optional(TLSVersion),
  max_version: Type.Optional(TLSVersion),
});

const OAuth2 = Type.Object({
  client_id: Type.String(),
  client_secret: Type.Optional(Type.String()),
  client_secret_file: Type.Optional(Type.String()),
  scopes: Type.Optional(Type.Array(Type.String())),
  token_url: Type.String(),
  endpoint_params: Type.Optional(Type.Record(Type.String(), Type.String())),
});

const HTTPProber = Type.Object({
  valid_status_codes: Type.Optional(Type.Array(Type.Number())),
  valid_http_versions: Type.Optional(Type.Array(Type.String())),
  method: Type.Optional(Type.String()),
  headers: Type.Optional(Type.Record(Type.String(), Type.String())),
  body_size_limit: Type.Optional(Type.Number()),
  compression: Type.Optional(
    LiteralUnion("gzip", "deflate", "br", "identity", "")
  ),
  follow_redirects: Type.Optional(Type.Boolean()),
  fail_if_ssl: Type.Optional(Type.Boolean()),
  fail_if_not_ssl: Type.Optional(Type.Boolean()),
  fail_if_body_matches_regexp: Type.Optional(Type.String()),
  fail_if_body_not_matches_regexp: Type.Optional(Type.String()),
  fail_if_header_matches: Type.Optional(Type.Array(HTTPHeaderMatchSpec)),
  fail_if_header_not_matches: Type.Optional(Type.Array(HTTPHeaderMatchSpec)),
  tls_config: Type.Optional(TLSConfig),
  basic_auth: Type.Optional(
    Type.Object({
      username: Type.Optional(Type.String()),
      password: Type.Optional(Type.String()),
      password_file: Type.Optional(Type.String()),
    })
  ),
  authorization: Type.Optional(
    Type.Object({
      type: Type.Optional(Type.String()),
      credentials: Type.Optional(Type.String()),
      credentials_file: Type.Optional(Type.String()),
    })
  ),
  proxy_url: Type.Optional(Type.String()),
  no_proxy: Type.Optional(Type.String()),
  proxy_from_environment: Type.Optional(Type.Boolean()),
  proxy_connect_header: Type.Optional(
    Type.Record(Type.String(), Type.Array(Type.String()))
  ),
  skip_resolve_phase_with_proxy: Type.Optional(Type.Boolean()),
  oauth2: Type.Optional(OAuth2),
  enable_http2: Type.Optional(Type.Boolean()),
  preferred_ip_protocol: Type.Optional(LiteralUnion("ip4", "ip6")),
  ip_protocol_fallback: Type.Optional(Type.Boolean()),
  body: Type.Optional(Type.String()),
  body_file: Type.Optional(Type.String()),
});

const QueryResponse = Type.Object({
  expect: Type.Optional(Type.String()),
  send: Type.Optional(Type.String()),
  starttls: Type.Optional(Type.Boolean()),
});

const TCPProber = Type.Object({
  preferred_ip_protocol: Type.Optional(LiteralUnion("ip4", "ip6")),
  ip_protocol_fallback: Type.Optional(Type.Boolean()),
  source_ip_address: Type.Optional(Type.String()),
  query_response: Type.Optional(Type.Array(QueryResponse)),
  tls: Type.Optional(Type.Boolean()),
  tls_config: Type.Optional(TLSConfig),
});

const ValidationRRS = Type.Object({
  fail_if_matches_regexp: Type.Optional(Type.Array(Type.String())),
  fail_if_all_match_regexp: Type.Optional(Type.Array(Type.String())),
  fail_if_not_matches_regexp: Type.Optional(Type.Array(Type.String())),
  fail_if_none_matches_regexp: Type.Optional(Type.Array(Type.String())),
});

const DNSProber = Type.Object({
  preferred_ip_protocol: Type.Optional(LiteralUnion("ip4", "ip6")),
  ip_protocol_fallback: Type.Optional(Type.Boolean()),
  source_ip_address: Type.Optional(Type.String()),
  transport_protocol: Type.Optional(LiteralUnion("udp", "tcp")),
  dns_over_tls: Type.Optional(Type.Boolean()),
  tls_config: Type.Optional(TLSConfig),
  query_name: Type.String(),
  query_type: Type.Optional(Type.String()),
  query_class: Type.Optional(Type.String()),
  recursion_desired: Type.Optional(Type.Boolean()),
  valid_rcodes: Type.Optional(Type.Array(Type.String())),
  validate_answer_rrs: Type.Optional(ValidationRRS),
  validate_authority_rrs: Type.Optional(ValidationRRS),
  validate_additional_rrs: Type.Optional(ValidationRRS),
});

const ICMPProber = Type.Object({
  preferred_ip_protocol: Type.Optional(LiteralUnion("ip4", "ip6")),
  ip_protocol_fallback: Type.Optional(Type.Boolean()),
  source_ip_address: Type.Optional(Type.String()),
  dont_fragment: Type.Optional(Type.Boolean()),
  payload_size: Type.Optional(Type.Number()),
  ttl: Type.Optional(Type.Number()),
});

const GRPCProber = Type.Object({
  service: Type.Optional(Type.String()),
  preferred_ip_protocol: Type.Optional(LiteralUnion("ip4", "ip6")),
  ip_protocol_fallback: Type.Optional(Type.Boolean()),
  tls: Type.Optional(Type.Boolean()),
  tls_config: Type.Optional(TLSConfig),
});

const Module = Type.Object({
  prober: LiteralUnion("http", "tcp", "dns", "icmp", "grpc"),
  timeout: Type.Optional(Duration),
  http: Type.Optional(HTTPProber),
  tcp: Type.Optional(TCPProber),
  dns: Type.Optional(DNSProber),
  icmp: Type.Optional(ICMPProber),
  grpc: Type.Optional(GRPCProber),
});

const Schema = Type.Object({
  modules: Type.Record(Type.String(), Module),
});

export default Schema;
