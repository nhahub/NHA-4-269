output "node_public_ips" {
  description = "Public IP for each k3s node by role"
  value       = { for k, inst in aws_instance.k3s : k => inst.public_ip }
}

output "node_private_ips" {
  description = "Private IP for each k3s node by internal join"
  value       = { for k, inst in aws_instance.k3s : k => inst.private_ip }
}

output "ssh_commands" {
  description = "Ready for SSH commands"
  value       = { for k, inst in aws_instance.k3s : k => "ssh -i ~/.ssh/id_ed25519 ubuntu@${inst.public_ip}" }
}