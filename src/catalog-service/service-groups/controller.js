import { serviceGroupService } from "./service.js";

export const serviceGroupController = {
  async list(req, res) {
    res.json(await serviceGroupService.listGroups(req.auth.accountId, req.query));
  },
  async create(req, res) {
    res.status(201).json({ data: await serviceGroupService.createGroup(req.auth.accountId, req.body) });
  },
  async update(req, res) {
    res.json({ data: await serviceGroupService.updateGroup(req.auth.accountId, req.params.id, req.body) });
  },
  async remove(req, res) {
    res.json({ data: await serviceGroupService.deleteGroup(req.auth.accountId, req.params.id) });
  },
};
