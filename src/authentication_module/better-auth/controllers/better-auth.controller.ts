import { All, Controller, Req, Res } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../../../utils/auth";
import { Public } from "../decorators/auth.decorators";

@Public()
@Controller("api/auth")
export class BetterAuthController {
  // Handle root /api/auth
  @All()
  async handleAuthRoot(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ): Promise<void> {
    return this.processAuthRequest(req, res);
  }

  // Handle all sub-paths /api/auth/*
  @All("*")
  async handleAuthPath(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ): Promise<void> {
    return this.processAuthRequest(req, res);
  }

  private async processAuthRequest(
    req: FastifyRequest,
    res: FastifyReply
  ): Promise<void> {
    try {
      // Construct request URL
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers.host || "localhost:8001";
      const url = new URL(req.url, `${protocol}://${host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.append(key, value);
          }
        }
      });

      // Ensure X-Forwarded-For is present for rate limiting
      if (!headers.has("x-forwarded-for") && req.ip) {
        headers.append("x-forwarded-for", req.ip);
      }

      // Create Fetch API-compatible request
      const fetchRequest = new Request(url.toString(), {
        method: req.method,
        headers,
        body:
          req.body && req.method !== "GET" && req.method !== "HEAD"
            ? JSON.stringify(req.body)
            : undefined,
      });

      // Process authentication request
      const response = await auth.handler(fetchRequest);

      // Forward response headers to client
      response.headers.forEach((value, key) => {
        res.header(key, value);
      });

      // Send response
      const responseText = await response.text();
      res.status(response.status).send(responseText || null);
    } catch (error) {
      console.error("[BetterAuth] Error:", error);
      res
        .status(500)
        .send({ error: "Internal authentication error", code: "AUTH_FAILURE" });
    }
  }
}
